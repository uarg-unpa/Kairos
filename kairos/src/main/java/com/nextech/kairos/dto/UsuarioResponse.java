package com.nextech.kairos.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String email;
    private Set<String> roles;
    private Set<String> permissions;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    public UsuarioResponse(Long id, String nombre, String email, Set<String> roles, 
                          Set<String> permissions, LocalDateTime fechaCreacion, LocalDateTime fechaActualizacion) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.roles = roles;
        this.permissions = permissions;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
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
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Set<String> getRoles() {
        return roles;
    }
    
    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
    
    public Set<String> getPermissions() {
        return permissions;
    }
    
    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions;
    }
    
    public LocalDateTime getfechaCreacion() {
        return fechaCreacion;
    }
    
    public void setfechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getfechaActualizacion() {
        return fechaActualizacion;
    }
    
    public void setfechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
