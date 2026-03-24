package com.nextech.kairos.dto;


import java.time.LocalDate;
import java.util.Set;

public class TareaResponse {

    private Long idTarea;
    private String nombre;
    private String descripcion;
    private String estado;
    private String prioridad;
    private LocalDate fechaCreacion;
    private LocalDate fechaFin;
    private LocalDate fechaCompletada;
    private Double horasEstimadas;

    // Relacionados
    private Long usuarioId;
    private String usuarioNombre;
    private Long iteracionId;

    private Set<CategoriaResponse> categorias;
    private Set<Long> dependenciasIds; // solo devolvemos los ids de las dependencias

    // --- Getters y Setters ---

    public Long getIdTarea() {
        return idTarea;
    }

    public void setIdTarea(Long idTarea) {
        this.idTarea = idTarea;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(String prioridad) {
        this.prioridad = prioridad;
    }

    public LocalDate getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDate fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public LocalDate getFechaCompletada() {
        return fechaCompletada;
    }

    public void setFechaCompletada(LocalDate fechaCompletada) {
        this.fechaCompletada = fechaCompletada;
    }

    public Double getHorasEstimadas() {
        return horasEstimadas;
    }

    public void setHorasEstimadas(Double horasEstimadas) {
        this.horasEstimadas = horasEstimadas;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public Long getIteracionId() {
        return iteracionId;
    }

    public void setIteracionId(Long iteracionId) {
        this.iteracionId = iteracionId;
    }

    public Set<CategoriaResponse> getCategorias() {
        return categorias;
    }

    public void setCategorias(Set<CategoriaResponse> categorias) {
        this.categorias = categorias;
    }

    public Set<Long> getDependenciasIds() {
        return dependenciasIds;
    }

    public void setDependenciasIds(Set<Long> dependenciasIds) {
        this.dependenciasIds = dependenciasIds;
    }
}
