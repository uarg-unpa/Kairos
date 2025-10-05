package com.nextech.kairos.service;

import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.repository.RolRepository;
import com.nextech.kairos.repository.PermisoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class RolService {
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private PermisoRepository permisoRepository;
    
    /**
     * Create or update role (equivalent to PHP's save method)
     */
    public Rol save(Rol rol) {
        return rolRepository.save(rol);
    }
    
    /**
     * Find role by ID (equivalent to PHP's constructor with ID)
     */
    @Transactional(readOnly = true)
    public Optional<Rol> findById(Long id) {
        return rolRepository.findById(id);
    }
    
    /**
     * Find role by name (equivalent to PHP's findByName)
     */
    @Transactional(readOnly = true)
    public Optional<Rol> findByName(String nombre) {
        return rolRepository.findByNombre(nombre);
    }
    
    /**
     * Get all roles (equivalent to PHP's ColeccionRoles)
     */
    @Transactional(readOnly = true)
    public List<Rol> findAll() {
        return rolRepository.findAll();
    }
    
    /**
     * Get all roles with permissions loaded
     */
    @Transactional(readOnly = true)
    public List<Rol> findAllWithPermisos() {
        return rolRepository.findAllWithPermisos();
    }
    
    /**
     * Create new role with name
     */
    public Rol createRole(String nombre) {
        if (rolRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El rol ya existe: " + nombre);
        }
        
        Rol newRole = new Rol(nombre);
        return save(newRole);
    }
    
    /**
     * Assign permission to role (equivalent to PHP's permission assignment)
     */
    public Rol assignPermission(Long rolId, Long permisoId) {
        Optional<Rol> rol = rolRepository.findById(rolId);
        Optional<Permiso> permiso = permisoRepository.findById(permisoId);
        
        if (rol.isPresent() && permiso.isPresent()) {
            rol.get().addPermiso(permiso.get());
            return save(rol.get());
        }
        
        throw new RuntimeException("Rol o Permiso no encontrado");
    }
    
    /**
     * Remove permission from role
     */
    public Rol removePermission(Long rolId, Long permisoId) {
        Optional<Rol> rol = rolRepository.findById(rolId);
        Optional<Permiso> permiso = permisoRepository.findById(permisoId);
        
        if (rol.isPresent() && permiso.isPresent()) {
            rol.get().removePermiso(permiso.get());
            return save(rol.get());
        }
        
        throw new RuntimeException("Rol o Permiso no encontrado");
    }
    
    /**
     * Get role permissions (equivalent to PHP's getPermisos)
     */
    @Transactional(readOnly = true)
    public Set<String> getRolePermissions(Long rolId) {
        Optional<Rol> rol = rolRepository.findByIdWithPermisos(rolId);
        
        if (rol.isPresent()) {
            return rol.get().getPermisos().stream()
                    .map(Permiso::getNombre)
                    .collect(Collectors.toSet());
        }
        
        return Set.of();
    }
    
    /**
     * Check if role has specific permission
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(Long rolId, String permisoName) {
        Set<String> permissions = getRolePermissions(rolId);
        return permissions.contains(permisoName);
    }
    
    /**
     * Delete role
     */
    public void deleteRol(Long rolId) {
        rolRepository.deleteById(rolId);
    }
    public Rol createRol(String nombre, List<Long> permisoIds) {
    if (rolRepository.existsByNombre(nombre)) {
        throw new RuntimeException("El rol ya existe: " + nombre);
    }

    Rol rol = new Rol(nombre);
    
    if (permisoIds != null) {
        List<Permiso> permisos = permisoRepository.findAllById(permisoIds);
        for (Permiso permiso : permisos) {
            rol.addPermiso(permiso);
        }
    }

    return rolRepository.save(rol);
}

public Rol updateRol(Long id, String nombre, List<Long> permisoIds) {
    Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

    rol.setNombre(nombre);
    
    // Limpiar permisos actuales
    rol.getPermisos().clear();

    // Reasignar permisos nuevos
    if (permisoIds != null) {
        List<Permiso> permisos = permisoRepository.findAllById(permisoIds);
        for (Permiso permiso : permisos) {
            rol.addPermiso(permiso);
        }
    }

    return rolRepository.save(rol);
}

    /**
     * Search roles by name
     */
    @Transactional(readOnly = true)
    public List<Rol> searchByName(String nombre) {
        return rolRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    /**
     * Get roles with specific permission
     */
    @Transactional(readOnly = true)
    public List<Rol> getRolesWithPermission(String permisoName) {
        return rolRepository.findByPermisoName(permisoName);
    }
    
    /**
     * Get roles for specific user
     */
    @Transactional(readOnly = true)
    public List<Rol> getRolesByUser(Long usuarioId) {
        return rolRepository.findByUsuarioId(usuarioId);
    }
}
