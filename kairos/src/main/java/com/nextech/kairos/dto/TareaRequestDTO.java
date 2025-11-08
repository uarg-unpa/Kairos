package com.nextech.kairos.dto;

import java.time.LocalDate;
import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO utilizado para recibir datos del cliente al CREAR o ACTUALIZAR una Tarea.
 */
public class TareaRequestDTO {

    @NotBlank(message = "El nombre de la tarea es obligatorio")
    @Size(max = 255)
    private String nombre;

    private String descripcion;

    @NotBlank(message = "El estado es obligatorio")
    @Size(max = 50)
    private String estado;

    @NotBlank(message = "La prioridad es obligatoria")
    @Size(max = 50)
    private String prioridad;

    private LocalDate fechaCreacion;
    private LocalDate fechaFin;
    private Double horasEstimadas;
    private Integer idTarea;
    private String usuarioNombre;
    private int iteracionNumero;
    private Set<CategoriaDTO> categorias;
    // private Double horasEstimadas; // Descomentar si añades este campo a tu
    // entidad Tarea

    // --- RELACIONES NECESARIAS ---

    @NotNull(message = "El ID del usuario asignado es obligatorio")
    private Long usuarioId;

    @NotNull(message = "El ID de la iteración es obligatorio")
    private Long iteracionId;

    // Lista de IDs para asociar categorías (relación N:M)
    private Set<Long> categoriaIds;

    // --- Getters y Setters ---

    public int getIteracionNumero() {
        return iteracionNumero;
    }

    public void setIteracionNombre(int iteracionNumero) {
        this.iteracionNumero = iteracionNumero;
    }

    public Set<CategoriaDTO> getCategorias() {
        return categorias;
    }

    public void setCategorias(Set<CategoriaDTO> categorias) {
        this.categorias = categorias;
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

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getIteracionId() {
        return iteracionId;
    }

    public void setIteracionId(Long iteracionId) {
        this.iteracionId = iteracionId;
    }

    public Set<Long> getCategoriaIds() {
        return categoriaIds;
    }

    public void setCategoriaIds(Set<Long> categoriaIds) {
        this.categoriaIds = categoriaIds;
    }

    public Integer getIdTarea() {
        return idTarea;
    }

    public void setIdTarea(Integer idTarea) {
        this.idTarea = idTarea;
    }

    public Double getHorasEstimadas() {
        return horasEstimadas;
    }

    public void setHorasEstimadas(Double horasEstimadas) {
        this.horasEstimadas = horasEstimadas;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

}

