package com.nextech.kairos.controller;


import com.nextech.kairos.dto.PermisoRequest;
import com.nextech.kairos.dto.PermisoResponse;
import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.service.PermisoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/permisos")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAuthority('PERMISSION_PERMISOS')")
public class PermisoController {
    
    @Autowired
    private PermisoService permisoService;
    
    @GetMapping
    public ResponseEntity<List<PermisoResponse>> getAllPermissions() {
        List<Permiso> permisos = permisoService.findAllWithRoles();
        List<PermisoResponse> response = permisos.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PermisoResponse> getPermissionById(@PathVariable Long id) {
        Optional<Permiso> permiso = permisoService.findById(id);
        
        if (permiso.isPresent()) {
            return ResponseEntity.ok(convertToResponse(permiso.get()));
        }
        
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<PermisoResponse>> searchPermissions(@RequestParam String nombre) {
        List<Permiso> permisos = permisoService.searchByName(nombre);
        List<PermisoResponse> response = permisos.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<PermisoResponse> createPermission(@Valid @RequestBody PermisoRequest request) {
        try {
            Permiso permiso = permisoService.createPermission(request.getNombre());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToResponse(permiso));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PermisoResponse> updatePermission(@PathVariable Long id, 
                                                           @Valid @RequestBody PermisoRequest request) {
        Optional<Permiso> existingPermiso = permisoService.findById(id);
        
        if (existingPermiso.isPresent()) {
            Permiso permiso = existingPermiso.get();
            permiso.setNombre(request.getNombre());
            
            Permiso updatedPermiso = permisoService.save(permiso);
            return ResponseEntity.ok(convertToResponse(updatedPermiso));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        Optional<Permiso> permiso = permisoService.findById(id);
        
        if (permiso.isPresent()) {
            permisoService.delete(id);
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.notFound().build();
    }
    
    private PermisoResponse convertToResponse(Permiso permiso) {
        Set<String> rolNames = permiso.getRoles().stream()
                .map(rol -> rol.getNombre())
                .collect(Collectors.toSet());
        
        return new PermisoResponse(
            permiso.getId(),
            permiso.getNombre(),
            rolNames,
            permiso.getCreatedAt(),
            permiso.getUpdatedAt()
        );
    }
}
