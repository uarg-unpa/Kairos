// package com.nextech.kairos.util (o service)
package com.nextech.kairos.service; 

import com.nextech.kairos.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    // Asegúrate de que este valor esté configurado en application.yml (o properties)
    @Value("${jwt.secret}") 
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // --- Métodos de GENERACIÓN (Ya lo tenías, revisado para usar Keys.secretKeyFor) ---

    public String generateToken(Usuario usuario) {
        String permisos = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(permiso -> permiso.getNombre())
                .distinct()
                .collect(Collectors.joining(","));
        
        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .claim("id", usuario.getId())
                .claim("nombre", usuario.getNombre())
                .claim("authorities", permisos) // Clave usada en el filtro
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // --- Métodos de EXTRACCIÓN y VALIDACIÓN (Necesarios para JwtAuthenticationFilter) ---

    // 1. Extrae el "subject" (el email)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    // 2. Extrae la lista de permisos que incrustaste
    public String extractAuthorities(String token) {
        return extractClaim(token, claims -> claims.get("authorities", String.class));
    }

    // 3. Verifica si el token es válido y no ha expirado
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            // El token expiró, lo manejamos como inválido
            return false; 
        } catch (Exception e) {
            // Cualquier otro error de parseo o firma (token inválido)
            return false;
        }
    }
    
    // --- Métodos Auxiliares ---
    
    // Método genérico para extraer cualquier claim
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Obtiene todos los claims del token
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Verifica la fecha de expiración
    private Boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
    
    // Genera la clave de firma a partir del secreto de la aplicación
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}