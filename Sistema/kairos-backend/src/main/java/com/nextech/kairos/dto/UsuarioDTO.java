package com.nextech.kairos.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private Set<String> roles; // Solo los nombres de roles, no objetos completos

    public UsuarioDTO() {}

    public UsuarioDTO(Long id, String nombre, String email, LocalDateTime fechaCreacion, LocalDateTime fechaActualizacion, Set<String> roles) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.roles = roles;
    }

    // Getters y Setters
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

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}

