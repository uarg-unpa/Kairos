package com.nextech.kairos.controller;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.nextech.kairos.dto.AuthResponse;
import com.nextech.kairos.dto.GoogleTokenRequest;
import com.nextech.kairos.dto.UserInfoResponse;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.service.UsuarioService;
import com.nextech.kairos.util.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    /**
     * obtener info del usuario
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal();

        Optional<Usuario> usuario = authService.getUserForSession(email);
        if (usuario.isPresent()) {
            Set<String> permissions = authService.getUserPermissionsForSession(email);
            boolean isAdmin = authService.isAdmin(email);

            UserInfoResponse response = new UserInfoResponse(
                usuario.get().getId(),
                usuario.get().getNombre(),
                usuario.get().getEmail(),
                permissions,
                isAdmin
            );

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * verificar si el usuario tiene permiso
     */
    @GetMapping("/check-permission/{permission}")
    public ResponseEntity<Boolean> checkPermission(@PathVariable String permission) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal();

        boolean hasPermission = authService.hasPermission(email, permission);
        return ResponseEntity.ok(hasPermission);
    }

    /**
     * verificar si el usuario es admin
     */
    @GetMapping("/is-admin")
    public ResponseEntity<Boolean> isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal();

        boolean isAdmin = authService.isAdmin(email);
        return ResponseEntity.ok(isAdmin);
    }

    /**
     * cerrar sesion
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        return ResponseEntity.ok(new AuthResponse("Logout successful", null, null));
    }

    /**
     * Flujo token-exchange: verifica el idToken de Google y devuelve JWT propio.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleTokenExchange(@RequestBody GoogleTokenRequest body) {
        try {
            if (body == null || body.getIdToken() == null || body.getIdToken().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse("idToken es requerido", null, null));
            }

            var transport = new NetHttpTransport();
            var jsonFactory = GsonFactory.getDefaultInstance();
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(body.getIdToken());
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse("idToken inválido", null, null));
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            Usuario usuario = authService.processGoogleLogin(email, name);
            authService.ensureAdminIfConfigured(email);
            if (!authService.hasSystemAccess(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AuthResponse("El usuario no tiene acceso al sistema", null, null));
            }

            Set<String> permissions = authService.getUserPermissionsForSession(email);
            var authorities = permissions.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toSet());
            usuario.getRoles().forEach(rol ->
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getNombre().toUpperCase().replace(" ", "_")))
            );

            String token = jwtUtil.generateToken(email, authorities);
return ResponseEntity.ok(new AuthResponse("OK", token, usuario));


        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Error procesando login de Google", null, null));
        }
    }
}
