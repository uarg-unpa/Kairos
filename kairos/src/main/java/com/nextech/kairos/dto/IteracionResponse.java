package com.nextech.kairos.dto;

public class IteracionResponse {
    private long idIteracion;
    private int numero;
    private String fechaInicio;
    private String fechaFin;
    private String descripcion;
    private Long idEtapa;

    public IteracionResponse() {}
    public IteracionResponse(long idIteracion, int numero, String fechaInicio, String fechaFin, String descripcion, Long idEtapa) {
        this.idIteracion = idIteracion;
        this.numero = numero;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.descripcion = descripcion;
        this.idEtapa = idEtapa;
    }
    
    // Getters y Setters
    public Long getIdEtapa(){
        return this.idEtapa;
    }

    public void setIdEtapa(Long idEtapa){
        this.idEtapa = idEtapa;
    }

    public long getIdIteracion() {
        return idIteracion;
    }
    public void setIdIteracion(long idIteracion) {
        this.idIteracion = idIteracion;
    }
    public int getNumero() {
        return numero;
    }
    public void setNumero(int numero) {
        this.numero = numero;
    }
    public String getFechaInicio() {
        return fechaInicio;
    }
    public void setFechaInicio(String fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    public String getFechaFin() {
        return fechaFin;
    }
    public void setFechaFin(String fechaFin) {
        this.fechaFin = fechaFin;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

}




