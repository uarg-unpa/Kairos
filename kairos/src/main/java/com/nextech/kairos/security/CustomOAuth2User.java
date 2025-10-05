package com.nextech.kairos.security;

import com.nextech.kairos.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class CustomOAuth2User implements OAuth2User {
    
    private OAuth2User oauth2User;
    private Usuario usuario;
    
    public CustomOAuth2User(OAuth2User oauth2User, Usuario usuario) {
        this.oauth2User = oauth2User;
        this.usuario = usuario;
    }
    
    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes();
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        //
        Set<GrantedAuthority> authorities = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(permiso -> new SimpleGrantedAuthority("PERMISSION_" + permiso.getNombre().toUpperCase()))
                .collect(Collectors.toSet());
        
        // agregar roles como autoridades
        Set<GrantedAuthority> roleAuthorities = usuario.getRoles().stream()
                .map(rol -> new SimpleGrantedAuthority("ROLE_" + rol.getNombre().toUpperCase().replace(" ", "_")))
                .collect(Collectors.toSet());
        
        authorities.addAll(roleAuthorities);
        return authorities;
    }
    
    @Override
    public String getName() {
        return oauth2User.getAttribute("name");
    }
    
    public String getEmail() {
        return oauth2User.getAttribute("email");
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
}
