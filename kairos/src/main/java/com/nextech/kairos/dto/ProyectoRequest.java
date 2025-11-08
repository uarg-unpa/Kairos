package com.nextech.kairos.dto;
import java.util.Date;

public class ProyectoRequest {
    private String nombre;
    private String equipo;
    private Date fechaCreacion;
    private String estado;
    
    public ProyectoRequest(){}

    public ProyectoRequest(String nombre, String equipo, Date fechaCreacion, String estado){
        this.nombre = nombre;
        this.equipo = equipo;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
    }

    // Getters
    public String getNombre() {
        return nombre;
    }

    public String getEquipo() {
        return equipo;
    }

    public Date getFechaCreacion() {
        return fechaCreacion;
    }

    public String getEstado() {
        return estado;
    }

    // Setters
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setEquipo(String equipo) {
        this.equipo = equipo;
    }

    public void setFechaCreacion(Date fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
