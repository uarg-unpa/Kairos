package com.nextech.kairos.util;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Permiso;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpSession;

import java.util.Set;
import java.util.stream.Collectors;

@Component("utilSessionHelper")
public class SessionHelper {
    
    public static final String SESSION_USUARIO = "usuario";
    public static final String SESSION_PERMISOS = "permisos";
    
    public void setUsuarioInSession(HttpSession session, Usuario usuario) {
        session.setAttribute(SESSION_USUARIO, usuario);
        
        Set<String> permisos = usuario.getRoles().stream()
            .flatMap(rol -> rol.getPermisos().stream())
            .map(Permiso::getNombre)
            .collect(Collectors.toSet());
        session.setAttribute(SESSION_PERMISOS, permisos);
    }
    
    public Usuario getUsuarioFromSession(HttpSession session) {
        return (Usuario) session.getAttribute(SESSION_USUARIO);
    }
    
    @SuppressWarnings("unchecked")
    public Set<String> getPermisosFromSession(HttpSession session) {
        return (Set<String>) session.getAttribute(SESSION_PERMISOS);
    }
    
    public boolean hasPermission(HttpSession session, String permiso) {
        Set<String> permisos = getPermisosFromSession(session);
        return permisos != null && permisos.contains(permiso);
    }
    
    public boolean isLoggedIn(HttpSession session) {
        return getUsuarioFromSession(session) != null;
    }
    public void clearSession(HttpSession session) {
        session.invalidate();
    }
}
