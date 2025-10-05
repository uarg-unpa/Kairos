package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.config.Constants;
import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.RolRepository;
import com.nextech.kairos.repository.UsuarioRepository;

@Service
@Transactional
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    @Transactional(readOnly = true)
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
    
    @Transactional(readOnly = true)
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }
    
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

    public Usuario createUserFromGoogle(String nombre, String email) {
        // 
        Optional<Usuario> existingUser = findByEmail(email);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        
        //
        Usuario newUser = new Usuario(nombre, email);
        
        // Usuario Común
        Optional<Rol> defaultRole = rolRepository.findByNombre(Constants.ROLE_USER);
        if (defaultRole.isPresent()) {
            newUser.addRol(defaultRole.get());
        }
        
        return save(newUser);
    }
    
    public Usuario assignRole(Long usuarioId, Long rolId) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        Optional<Rol> rol = rolRepository.findById(rolId);
        
        if (usuario.isPresent() && rol.isPresent()) {
            usuario.get().addRol(rol.get());
            return save(usuario.get());
        }
        
        throw new RuntimeException("Usuario o Rol no encontrado");
    }
    
    public Usuario removeRole(Long usuarioId, Long rolId) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        Optional<Rol> rol = rolRepository.findById(rolId);
        
        if (usuario.isPresent() && rol.isPresent()) {
            usuario.get().removeRol(rol.get());
            return save(usuario.get());
        }
        
        throw new RuntimeException("Usuario o Rol no encontrado");
    }
    
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
    @Transactional(readOnly = true)
    public boolean hasPermission(Long usuarioId, String permisoName) {
        Set<String> permissions = getUserPermissions(usuarioId);
        return permissions.contains(permisoName);
    }
    
    @Transactional(readOnly = true)
    public boolean hasRole(Long usuarioId, String roleName) {
        Optional<Usuario> usuario = usuarioRepository.findByIdWithRolesAndPermisos(usuarioId);
        
        if (usuario.isPresent()) {
            return usuario.get().getRoles().stream()
                    .anyMatch(rol -> rol.getNombre().equals(roleName));
        }
        
        return false;
    }
    
    @Transactional(readOnly = true)
    public boolean isAdmin(Long usuarioId) {
        return hasRole(usuarioId, Constants.ROLE_ADMIN);
    }
    
    public void delete(Long usuarioId) {
        usuarioRepository.deleteById(usuarioId);
    }
    
    @Transactional(readOnly = true)
    public List<Usuario> searchByName(String nombre) {
        return usuarioRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    @Transactional(readOnly = true)
    public List<Usuario> getUsersByRole(String roleName) {
        return usuarioRepository.findByRoleName(roleName);
    }
    
    @Transactional(readOnly = true)
    public List<Usuario> getUsersWithPermission(String permisoName) {
        return usuarioRepository.findByPermisoName(permisoName);
    }
}
