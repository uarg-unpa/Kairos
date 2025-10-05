package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.repository.PermisoRepository;

@Service
@Transactional
public class PermisoService {
    
    @Autowired
    private PermisoRepository permisoRepository;
    
    public Permiso save(Permiso permiso) {
        return permisoRepository.save(permiso);
    }
    
    @Transactional(readOnly = true)
    public Optional<Permiso> findById(Long id) {
        return permisoRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Permiso> findByName(String nombre) {
        return permisoRepository.findByNombre(nombre);
    }
    
    @Transactional(readOnly = true)
    public List<Permiso> findAll() {
        return permisoRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<Permiso> findAllWithRoles() {
        return permisoRepository.findAllWithRoles();
    }
    
    public Permiso createPermission(String nombre) {
        if (permisoRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El permiso ya existe: " + nombre);
        }
        
        Permiso newPermission = new Permiso(nombre);
        return save(newPermission);
    }
    
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

    @Transactional(readOnly = true)
    public List<Permiso> searchByName(String nombre) {
        return permisoRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    @Transactional(readOnly = true)
    public List<Permiso> getPermissionsByRole(Long rolId) {
        return permisoRepository.findByRolId(rolId);
    }
    
    @Transactional(readOnly = true)
    public List<Permiso> getPermissionsByRoleName(String rolName) {
        return permisoRepository.findByRolName(rolName);
    }
    
    @Transactional(readOnly = true)
    public List<Permiso> getPermissionsByUser(Long usuarioId) {
        return permisoRepository.findByUsuarioId(usuarioId);
    }
    
    @Transactional(readOnly = true)
    public List<Permiso> getPermissionsByUserEmail(String email) {
        return permisoRepository.findByUsuarioEmail(email);
    }
}
