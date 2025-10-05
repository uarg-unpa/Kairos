package com.nextech.kairos.service;

import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.repository.PermisoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PermisoService {
    
    @Autowired
    private PermisoRepository permisoRepository;
    
    /**
     * Create or update permission (equivalent to PHP's save method)
     */
    public Permiso save(Permiso permiso) {
        return permisoRepository.save(permiso);
    }
    
    /**
     * Find permission by ID (equivalent to PHP's constructor with ID)
     */
    @Transactional(readOnly = true)
    public Optional<Permiso> findById(Long id) {
        return permisoRepository.findById(id);
    }
    
    /**
     * Find permission by name (equivalent to PHP's findByName)
     */
    @Transactional(readOnly = true)
    public Optional<Permiso> findByName(String nombre) {
        return permisoRepository.findByNombre(nombre);
    }
    
    /**
     * Get all permissions (equivalent to PHP's ColeccionPermisos)
     */
    @Transactional(readOnly = true)
    public List<Permiso> findAll() {
        return permisoRepository.findAll();
    }
    
    /**
     * Get all permissions with roles loaded
     */
    @Transactional(readOnly = true)
    public List<Permiso> findAllWithRoles() {
        return permisoRepository.findAllWithRoles();
    }
    
    /**
     * Create new permission with name
     */
    public Permiso createPermission(String nombre) {
        if (permisoRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El permiso ya existe: " + nombre);
        }
        
        Permiso newPermission = new Permiso(nombre);
        return save(newPermission);
    }
    
    /**
     * Delete permission
     */
    public void delete(Long permisoId) {
        permisoRepository.deleteById(permisoId);
    }
    public Permiso createPermiso(String nombre) {
    return createPermission(nombre);
}

public Permiso updatePermiso(Long id, String nombre) {
    Permiso permiso = permisoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
    permiso.setNombre(nombre);
    return save(permiso);
}

public void deletePermiso(Long permisoId) {
    delete(permisoId);
}

    /**
     * Search permissions by name
     */
    @Transactional(readOnly = true)
    public List<Permiso> searchByName(String nombre) {
        return permisoRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    /**
     * Get permissions for specific role
     */
    @Transactional(readOnly = true)
    public List<Permiso> getPermissionsByRole(Long rolId) {
        return permisoRepository.findByRolId(rolId);
    }
    
    /**
     * Get permissions for specific role by name
     */
    @Transactional(readOnly = true)
    public List<Permiso> getPermissionsByRoleName(String rolName) {
        return permisoRepository.findByRolName(rolName);
    }
    
    /**
     * Get permissions for specific user (through roles)
     */
    @Transactional(readOnly = true)
    public List<Permiso> getPermissionsByUser(Long usuarioId) {
        return permisoRepository.findByUsuarioId(usuarioId);
    }
    
    /**
     * Get permissions for specific user by email (through roles)
     */
    @Transactional(readOnly = true)
    public List<Permiso> getPermissionsByUserEmail(String email) {
        return permisoRepository.findByUsuarioEmail(email);
    }
}
