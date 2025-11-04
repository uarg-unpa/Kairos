package com.nextech.kairos.dto;

import java.time.LocalDate;
import java.util.Set;

public class TareaRequestDTO {

    private String nombre;
    private String descripcion;
    private String prioridad;
    private String estado;
    private LocalDate fechaCreacion;
    private LocalDate fechaFin;
    private Double horasEstimadas;
    private Long usuarioId;
    private Long iteracionId;
    private Set<Long> categoriaIds; // IDs de las categorías asociadas

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDate fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public Double getHorasEstimadas() { return horasEstimadas; }
    public void setHorasEstimadas(Double horasEstimadas) { this.horasEstimadas = horasEstimadas; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Long getIteracionId() { return iteracionId; }
    public void setIteracionId(Long iteracionId) { this.iteracionId = iteracionId; }

    public Set<Long> getCategoriaIds() { return categoriaIds; }
    public void setCategoriaIds(Set<Long> categoriaIds) { this.categoriaIds = categoriaIds; }
}

