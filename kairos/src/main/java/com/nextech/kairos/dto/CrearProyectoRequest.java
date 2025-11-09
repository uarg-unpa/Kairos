package com.nextech.kairos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CrearProyectoRequest {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 255)
    private String nombre;

    @Size(max = 255)
    private String equipo;

    private String descripcion;

    private String fechaInicio; // formato: "2025-11-09"

    private String logo; // base64

    @NotNull(message = "Debe seleccionar un líder")
    private Long liderId;

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEquipo() { return equipo; } 
    public void setEquipo(String equipo) { this.equipo = equipo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public Long getLiderId() { return liderId; }
    public void setLiderId(Long liderId) { this.liderId = liderId; }
}