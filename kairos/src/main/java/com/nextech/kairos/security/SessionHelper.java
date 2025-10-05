package com.nextech.kairos.security;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Permiso;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpSession;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Helper class for session management (equivalent to PHP's session handling)
 */
@Component
public class SessionHelper {
    
    public static final String SESSION_USUARIO = "usuario";
    public static final String SESSION_PERMISOS = "permisos";
    
    /**
     * Set user in session
     */
    public void setUsuarioInSession(HttpSession session, Usuario usuario) {
        session.setAttribute(SESSION_USUARIO, usuario);
        
        // Also store permissions for quick access
        Set<String> permisos = usuario.getRoles().stream()
            .flatMap(rol -> rol.getPermisos().stream())
            .map(Permiso::getNombre)
            .collect(Collectors.toSet());
        session.setAttribute(SESSION_PERMISOS, permisos);
    }
    
    /**
     * Get user from session
     */
    public Usuario getUsuarioFromSession(HttpSession session) {
        return (Usuario) session.getAttribute(SESSION_USUARIO);
    }
    
    /**
     * Get user permissions from session
     */
    @SuppressWarnings("unchecked")
    public Set<String> getPermisosFromSession(HttpSession session) {
        return (Set<String>) session.getAttribute(SESSION_PERMISOS);
    }
    
    /**
     * Check if user has permission (from session)
     */
    public boolean hasPermission(HttpSession session, String permiso) {
        Set<String> permisos = getPermisosFromSession(session);
        return permisos != null && permisos.contains(permiso);
    }
    
    /**
     * Check if user is logged in
     */
    public boolean isLoggedIn(HttpSession session) {
        return getUsuarioFromSession(session) != null;
    }
    
    /**
     * Clear session
     */
    public void clearSession(HttpSession session) {
        session.invalidate();
    }
}
