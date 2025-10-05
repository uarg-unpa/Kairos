package com.nextech.kairos.jwt;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.nextech.kairos.service.JwtUtil;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil; // El util que creaste para generar/validar tokens
    
    // **NOTA:** Necesitas agregar métodos de validación al JwtUtil para que este filtro funcione.

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String userEmail = null; // Usaremos el email como username

        // 1. Extraer el token del encabezado Authorization: Bearer <token>
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                // **TODO:** Implementar la extracción del email en JwtUtil.
                userEmail = jwtUtil.extractUsername(jwt); 
            } catch (Exception e) {
                // El token es inválido o expiró.
                // Spring Security simplemente no autenticará la solicitud.
                System.err.println("JWT inválido o expirado: " + e.getMessage());
            }
        }

        // 2. Si se encontró un email y no hay autenticación en el contexto
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // **TODO:** Implementar la validación y extracción de permisos en JwtUtil.
            if (jwtUtil.validateToken(jwt)) {
                
                // Obtener las authorities (permisos) del token
                String authoritiesString = jwtUtil.extractAuthorities(jwt); 
                
                // Mapear los permisos a objetos GrantedAuthority
                var authorities = Arrays.stream(authoritiesString.split(","))
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
                
                // Crear un objeto UserDetails (o un custom principal)
                UserDetails userDetails = new User(userEmail, "", authorities);
                
                // Crear el objeto de autenticación
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                // Establecer la autenticación en el contexto de Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 3. Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}