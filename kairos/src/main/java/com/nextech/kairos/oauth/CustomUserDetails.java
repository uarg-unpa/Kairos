package com.nextech.kairos.oauth;

import com.nextech.kairos.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Adaptador que envuelve al Usuario de la BD y al OAuth2User de Google.
 * Proporciona a Spring Security las authorities (Roles/Permisos) correctas.
 */
public class CustomUserDetails implements OAuth2User {

    private final Usuario usuario;
    private final Map<String, Object> attributes;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Usuario usuario, Map<String, Object> attributes) {
        this.usuario = usuario;
        this.attributes = attributes;
        
        // Mapea los Permisos de tu modelo (Rol -> Permiso) a las Authorities de Spring Security.
        // Esto crea una colección de SimpleGrantedAuthority con el nombre de cada permiso (ej: "PERMISO_ROLES").
        this.authorities = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(permiso -> new SimpleGrantedAuthority(permiso.getNombre()))
                .collect(Collectors.toSet());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        // Devuelve el identificador único del usuario, que es el email.
        return usuario.getEmail();
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
}