package com.nextech.kairos.service;

import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.config.Constants;
import com.nextech.kairos.model.Usuario;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UsuarioService usuarioService;
    
    public Usuario authenticateWithGoogle(String nombre, String email) {
        return usuarioService.createUserFromGoogle(nombre, email);
    }
    
    public Usuario processGoogleLogin(String email, String name) throws Exception {
        try {
            Optional<Usuario> existingUser = usuarioService.findByEmail(email);
            
            if (existingUser.isPresent()) {
                Usuario usuario = existingUser.get();
                if (!usuario.getNombre().equals(name)) {
                    usuario.setNombre(name);
                    usuarioService.save(usuario);
                }
                return usuario;
            } else {
                return usuarioService.createUserFromGoogle(name, email);
            }
        } catch (Exception e) {
            throw new Exception("Error processing Google login: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public boolean hasSystemAccess(String email) {
        Optional<Usuario> usuario = usuarioService.findByEmail(email);
        
        if (usuario.isPresent()) {
            Set<String> permissions = usuarioService.getUserPermissions(usuario.get().getId());
            return permissions.contains(Constants.PERMISSION_INGRESAR);
        }
        
        return false;
    }
    
    @Transactional(readOnly = true)
    public boolean hasPermission(String email, String permisoName) {
        Optional<Usuario> usuario = usuarioService.findByEmail(email);
        
        if (usuario.isPresent()) {
            return usuarioService.hasPermission(usuario.get().getId(), permisoName);
        }
        
        return false;
    }
    
    @Transactional(readOnly = true)
    public boolean isAdmin(String email) {
        Optional<Usuario> usuario = usuarioService.findByEmail(email);
        
        if (usuario.isPresent()) {
            return usuarioService.isAdmin(usuario.get().getId());
        }
        
        return false;
    }
    
    @Transactional(readOnly = true)
    public Optional<Usuario> getUserForSession(String email) {
        return usuarioService.findByEmail(email);
    }
    
    @Transactional(readOnly = true)
    public Set<String> getUserPermissionsForSession(String email) {
        Optional<Usuario> usuario = usuarioService.findByEmail(email);
        
        if (usuario.isPresent()) {
            return usuarioService.getUserPermissions(usuario.get().getId());
        }
        
        return Set.of();
    }
}
