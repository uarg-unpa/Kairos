package com.nextech.kairos.service;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.repository.UsuarioRepository;
import com.nextech.kairos.repository.RolRepository;
import com.nextech.kairos.config.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    /**
     * Create or update user (equivalent to PHP's save method)
     */
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    /**
     * Find user by ID (equivalent to PHP's constructor with ID)
     */
    @Transactional(readOnly = true)
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }
    
    /**
     * Find user by email (equivalent to PHP's findByEmail)
     */
    @Transactional(readOnly = true)
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
    
    /**
     * Get all users (equivalent to PHP's ColeccionUsuarios)
     */
    @Transactional(readOnly = true)
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }
    
    /**
     * Get all users with roles loaded
     */
    @Transactional(readOnly = true)
    public List<Usuario> findAllWithRoles() {
        return usuarioRepository.findAllWithRoles();
    }
    public void createUsuario(String nombre, String email, List<Long> rolesIds) {
    Usuario usuario = new Usuario(nombre, email);
    if (rolesIds != null && !rolesIds.isEmpty()) {
        List<Rol> roles = rolRepository.findAllById(rolesIds);
        for (Rol rol : roles) {
            usuario.addRol(rol);
        }
    }
    usuarioRepository.save(usuario);
}

public void updateUsuario(Long id, String nombre, String email, List<Long> rolesIds) {
    Optional<Usuario> optUsuario = usuarioRepository.findById(id);
    if (optUsuario.isPresent()) {
        Usuario usuario = optUsuario.get();
        usuario.setNombre(nombre);
        usuario.setEmail(email);

        // Limpiar roles actuales
        usuario.getRoles().clear();

        // Agregar roles nuevos
        if (rolesIds != null && !rolesIds.isEmpty()) {
            List<Rol> roles = rolRepository.findAllById(rolesIds);
            for (Rol rol : roles) {
                usuario.addRol(rol);
            }
        }

        usuarioRepository.save(usuario);
    } else {
        throw new RuntimeException("Usuario no encontrado");
    }
}

public void deleteUsuario(Long id) {
    usuarioRepository.deleteById(id);
}

    /**
     * Create new user with Google OAuth data (equivalent to PHP's auto-registration)
     */
    public Usuario createUserFromGoogle(String nombre, String email) {
        // Check if user already exists
        Optional<Usuario> existingUser = findByEmail(email);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        
        // Create new user
        Usuario newUser = new Usuario(nombre, email);
        
        // Assign default role (Usuario Común)
        Optional<Rol> defaultRole = rolRepository.findByNombre(Constants.ROLE_USER);
        if (defaultRole.isPresent()) {
            newUser.addRol(defaultRole.get());
        }
        
        return save(newUser);
    }
    
    /**
     * Assign role to user (equivalent to PHP's role assignment)
     */
    public Usuario assignRole(Long usuarioId, Long rolId) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        Optional<Rol> rol = rolRepository.findById(rolId);
        
        if (usuario.isPresent() && rol.isPresent()) {
            usuario.get().addRol(rol.get());
            return save(usuario.get());
        }
        
        throw new RuntimeException("Usuario o Rol no encontrado");
    }
    
    /**
     * Remove role from user
     */
    public Usuario removeRole(Long usuarioId, Long rolId) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        Optional<Rol> rol = rolRepository.findById(rolId);
        
        if (usuario.isPresent() && rol.isPresent()) {
            usuario.get().removeRol(rol.get());
            return save(usuario.get());
        }
        
        throw new RuntimeException("Usuario o Rol no encontrado");
    }
    
    /**
     * Get user permissions (equivalent to PHP's getPermisos through roles)
     */
    @Transactional(readOnly = true)
    public Set<String> getUserPermissions(Long usuarioId) {
        Optional<Usuario> usuario = usuarioRepository.findByIdWithRolesAndPermisos(usuarioId);
        
        if (usuario.isPresent()) {
            return usuario.get().getRoles().stream()
                    .flatMap(rol -> rol.getPermisos().stream())
                    .map(Permiso::getNombre)
                    .collect(Collectors.toSet());
        }
        
        return Set.of();
    }
    
    /**
     * Check if user has specific permission (equivalent to PHP's hasPermission)
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(Long usuarioId, String permisoName) {
        Set<String> permissions = getUserPermissions(usuarioId);
        return permissions.contains(permisoName);
    }
    
    /**
     * Check if user has specific role
     */
    @Transactional(readOnly = true)
    public boolean hasRole(Long usuarioId, String roleName) {
        Optional<Usuario> usuario = usuarioRepository.findByIdWithRolesAndPermisos(usuarioId);
        
        if (usuario.isPresent()) {
            return usuario.get().getRoles().stream()
                    .anyMatch(rol -> rol.getNombre().equals(roleName));
        }
        
        return false;
    }
    
    /**
     * Check if user is admin (equivalent to PHP's isAdmin check)
     */
    @Transactional(readOnly = true)
    public boolean isAdmin(Long usuarioId) {
        return hasRole(usuarioId, Constants.ROLE_ADMIN);
    }
    
    /**
     * Delete user
     */
    public void delete(Long usuarioId) {
        usuarioRepository.deleteById(usuarioId);
    }
    
    /**
     * Search users by name
     */
    @Transactional(readOnly = true)
    public List<Usuario> searchByName(String nombre) {
        return usuarioRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<Usuario> getUsersByRole(String roleName) {
        return usuarioRepository.findByRoleName(roleName);
    }
    
    /**
     * Get users with specific permission
     */
    @Transactional(readOnly = true)
    public List<Usuario> getUsersWithPermission(String permisoName) {
        return usuarioRepository.findByPermisoName(permisoName);
    }
}
