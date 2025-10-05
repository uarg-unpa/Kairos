package com.nextech.kairos.controller;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.RolRequest;
import com.nextech.kairos.dto.RolResponse;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.service.RolService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAuthority('PERMISSION_ROLES')")
public class RolController {
    
    @Autowired
    private RolService rolService;
    
    @GetMapping
    public ResponseEntity<List<RolResponse>> getAllRoles() {
        List<Rol> roles = rolService.findAllWithPermisos();
        List<RolResponse> response = roles.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RolResponse> getRoleById(@PathVariable Long id) {
        Optional<Rol> rol = rolService.findById(id);
        
        if (rol.isPresent()) {
            return ResponseEntity.ok(convertToResponse(rol.get()));
        }
        
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/search")
    public ResponseEntity<List<RolResponse>> searchRoles(@RequestParam String nombre) {
        List<Rol> roles = rolService.searchByName(nombre);
        List<RolResponse> response = roles.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<RolResponse> createRole(@Valid @RequestBody RolRequest request) {
        try {
            Rol rol = rolService.createRole(request.getNombre());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToResponse(rol));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RolResponse> updateRole(@PathVariable Long id, 
                                                 @Valid @RequestBody RolRequest request) {
        Optional<Rol> existingRol = rolService.findById(id);
        
        if (existingRol.isPresent()) {
            Rol rol = existingRol.get();
            rol.setNombre(request.getNombre());
            
            Rol updatedRol = rolService.save(rol);
            return ResponseEntity.ok(convertToResponse(updatedRol));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        Optional<Rol> rol = rolService.findById(id);
        
        if (rol.isPresent()) {
            rolService.deleteRol(id);
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/{rolId}/permisos/{permisoId}")
    public ResponseEntity<RolResponse> assignPermission(@PathVariable Long rolId, 
                                                       @PathVariable Long permisoId) {
        try {
            Rol rol = rolService.assignPermission(rolId, permisoId);
            return ResponseEntity.ok(convertToResponse(rol));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{rolId}/permisos/{permisoId}")
    public ResponseEntity<RolResponse> removePermission(@PathVariable Long rolId, 
                                                       @PathVariable Long permisoId) {
        try {
            Rol rol = rolService.removePermission(rolId, permisoId);
            return ResponseEntity.ok(convertToResponse(rol));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}/permissions")
    public ResponseEntity<Set<String>> getRolePermissions(@PathVariable Long id) {
        Set<String> permissions = rolService.getRolePermissions(id);
        return ResponseEntity.ok(permissions);
    }
    
    private RolResponse convertToResponse(Rol rol) {
        Set<String> permisoNames = rol.getPermisos().stream()
                .map(permiso -> permiso.getNombre())
                .collect(Collectors.toSet());
        
        return new RolResponse(
            rol.getId(),
            rol.getNombre(),
            permisoNames,
            rol.getCreatedAt(),
            rol.getUpdatedAt()
        );
    }
}
