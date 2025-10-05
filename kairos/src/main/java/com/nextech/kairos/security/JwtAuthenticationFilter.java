package com.nextech.kairos.security;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT Authentication Filter (equivalent to PHP's session management)
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthService authService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt)) {
                String email = jwtUtil.getEmailFromToken(jwt);
                
                Optional<Usuario> usuario = authService.getUserForSession(email);
                if (usuario.isPresent()) {
                    // Get user permissions and convert to authorities
                    Set<String> permissions = authService.getUserPermissionsForSession(email);
                    Set<SimpleGrantedAuthority> authorities = permissions.stream()
    .map(SimpleGrantedAuthority::new) // <-- directamente usar los nombres
    .collect(Collectors.toSet());

                    
                    // Add role authorities
                    usuario.get().getRoles().forEach(rol -> 
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getNombre().toUpperCase().replace(" ", "_")))
                    );
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(email, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
    // 1. Intentar obtener el token del header Authorization
    String bearerToken = request.getHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
        return bearerToken.substring(7);
    }

    // 2. Si no está en el header, intentar leerlo desde cookies
    if (request.getCookies() != null) {
        for (var cookie : request.getCookies()) {
            if ("JWT_TOKEN".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
    }

    // 3. No se encontró el token
    return null;
}

}
