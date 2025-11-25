package com.nextech.kairos.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class RolResponse {
    private Long id;
    private String nombre;
    private Set<String> permisos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public RolResponse(Long id, String nombre, Set<String> permisos, 
                      LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.nombre = nombre;
        this.permisos = permisos;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public Set<String> getPermisos() {
        return permisos;
    }
    
    public void setPermisos(Set<String> permisos) {
        this.permisos = permisos;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
