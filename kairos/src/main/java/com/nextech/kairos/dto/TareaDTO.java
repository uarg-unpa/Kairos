package com.nextech.kairos.dto;

import java.time.LocalDate;
import java.util.Set;


public class TareaDTO {

    private Integer idTarea;
    private String nombre;
    private String descripcion;
    private String estado;
    private String prioridad;
    private LocalDate fechaCreacion;
    private LocalDate fechaFin;
    private Double horasEstimadas;

    private String usuarioNombre;
    private String usuarioRol;

    private int iteracionNumero;

    private Set<CategoriaDTO> categorias;


    // Getters y Setters
    public Integer getIdTarea() { return idTarea; }
    public void setIdTarea(Integer idTarea) { this.idTarea = idTarea; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDate fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public Double getHorasEstimadas() { return horasEstimadas; }
    public void setHorasEstimadas(Double horasEstimadas) { this.horasEstimadas = horasEstimadas; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }

    public String getUsuarioRol() { return usuarioRol; }
    public void setUsuarioRol(String usuarioRol) { this.usuarioRol = usuarioRol; }

    public int getIteracionNumero() { return iteracionNumero; }
    public void setIteracionNumero(int iteracionNumero) { this.iteracionNumero = iteracionNumero; }

    public Set<CategoriaDTO> getCategorias() { return categorias; }
    public void setCategorias(Set<CategoriaDTO> categorias) { this.categorias = categorias; }
}
