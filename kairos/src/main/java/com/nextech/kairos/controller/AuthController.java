// controller/AuthController.java
package com.nextech.kairos.controller;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.service.JwtUtil; // NUEVO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Clase DTO para la respuesta del login
class LoginResponse {
    public String token;
    public Usuario usuario;
    
    public LoginResponse(String token, Usuario usuario) {
        this.token = token;
        this.usuario = usuario;
    }
}

@RestController
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired // NUEVO: Para generar el token
    private JwtUtil jwtUtil; 

    @GetMapping("/loginSuccess")
    public LoginResponse loginSuccess(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        String nombre = principal.getAttribute("name");

        // 1. Busca o crea el usuario
        Usuario usuario = authService.loginOrCreateUsuario(nombre, email);
        
        // 2. Genera el token JWT que incluye los permisos
        String jwtToken = jwtUtil.generateToken(usuario);
        
        // 3. Redirige Angular al login, donde recibirá este objeto (configurado en SecurityConfig)
        return new LoginResponse(jwtToken, usuario); 
    }

    // El endpoint /me ahora devuelve el objeto Usuario DTO
    @GetMapping("/me")
    public Usuario getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        // Asegúrate de que este endpoint devuelve un DTO limpio, sin la contraseña si la hubiera.
        return authService.loginOrCreateUsuario(
             principal.getAttribute("name"),
             principal.getAttribute("email")
        );
    }
}
