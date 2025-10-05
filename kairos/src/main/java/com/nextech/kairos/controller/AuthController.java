package com.nextech.kairos.controller;
import com.nextech.kairos.dto.AuthResponse;
import com.nextech.kairos.dto.UserInfoResponse;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
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
        return ResponseEntity.ok(new AuthResponse("Logout successful", null));
    }
}
