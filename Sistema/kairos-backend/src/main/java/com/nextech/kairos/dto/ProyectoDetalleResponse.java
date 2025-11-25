package com.nextech.kairos.dto;

import java.time.LocalDate;
import java.util.List;

import com.nextech.kairos.model.Proyecto;

public class ProyectoDetalleResponse {
    private Long idProyecto;
    private String nombre;
    private String equipo;
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaCreacion;
    private String estado;
    private String logo;
    private List<UsuarioProyectoResponse> usuariosProyecto;

    // Constructor desde Proyecto
    public ProyectoDetalleResponse(Proyecto p, List<UsuarioProyectoResponse> usuarios) {
        this.idProyecto = p.getIdProyecto();
        this.nombre = p.getNombre();
        this.equipo = p.getEquipo();
        this.descripcion = p.getDescripcion();
        this.fechaInicio = p.getFechaInicio();
        this.fechaCreacion = p.getFechaCreacion();
        this.estado = p.getEstado();
        this.logo = p.getLogo();
        this.usuariosProyecto = usuarios;
    }

    // Getters
    public Long getIdProyecto() { return idProyecto; }
    public String getNombre() { return nombre; }
    public String getEquipo() { return equipo; }
    public String getDescripcion() { return descripcion; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public String getEstado() { return estado; }
    public String getLogo() { return logo; }
    public List<UsuarioProyectoResponse> getUsuariosProyecto() { return usuariosProyecto; }
}