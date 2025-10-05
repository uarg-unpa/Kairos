package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.repository.PermisoRepository;
import com.nextech.kairos.repository.RolRepository;

@Service
@Transactional
public class RolService {
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private PermisoRepository permisoRepository;
    
    public Rol save(Rol rol) {
        return rolRepository.save(rol);
    }
    
    @Transactional(readOnly = true)
    public Optional<Rol> findById(Long id) {
        return rolRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Rol> findByName(String nombre) {
        return rolRepository.findByNombre(nombre);
    }
    
    @Transactional(readOnly = true)
    public List<Rol> findAll() {
        return rolRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<Rol> findAllWithPermisos() {
        return rolRepository.findAllWithPermisos();
    }
    
    public Rol createRole(String nombre) {
        if (rolRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El rol ya existe: " + nombre);
        }
        
        Rol newRole = new Rol(nombre);
        return save(newRole);
    }
    
    public Rol assignPermission(Long rolId, Long permisoId) {
        Optional<Rol> rol = rolRepository.findById(rolId);
        Optional<Permiso> permiso = permisoRepository.findById(permisoId);
        
        if (rol.isPresent() && permiso.isPresent()) {
            rol.get().addPermiso(permiso.get());
            return save(rol.get());
        }
        
        throw new RuntimeException("Rol o Permiso no encontrado");
    }
    
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

    @Transactional(readOnly = true)
    public List<Rol> searchByName(String nombre) {
        return rolRepository.findByNombreContainingIgnoreCase(nombre);
    }
    @Transactional(readOnly = true)
    public List<Rol> getRolesWithPermission(String permisoName) {
        return rolRepository.findByPermisoName(permisoName);
    }
    
    @Transactional(readOnly = true)
    public List<Rol> getRolesByUser(Long usuarioId) {
        return rolRepository.findByUsuarioId(usuarioId);
    }
}
