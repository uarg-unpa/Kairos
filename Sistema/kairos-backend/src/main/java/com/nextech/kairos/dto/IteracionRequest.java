package com.nextech.kairos.dto;
import java.util.Date;

public class IteracionRequest {
    private Integer numero;
    private String descripcion;
    private Date fechaInicio;
    private Date fechaFin;

    public IteracionRequest(){}

    public IteracionRequest(Integer numero, String descripcion, Date fechaInicio, Date fechaFin){
        this.numero = numero;
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }   

    // Getters
    public Integer getNumero() {        
        return numero;
    }   
    public String getDescripcion() {
        return descripcion;
    }
    public Date getFechaInicio() {
        return fechaInicio;
    }
    public Date getFechaFin() {
        return fechaFin;
    }
    // Setters
    public void setNumero(Integer numero) {
        this.numero = numero;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public void setFechaInicio(Date fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    public void setFechaFin(Date fechaFin) {
        this.fechaFin = fechaFin;
    }
    

}
