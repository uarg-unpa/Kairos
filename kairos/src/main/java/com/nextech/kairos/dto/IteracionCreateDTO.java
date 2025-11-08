package com.nextech.kairos.dto;

public class IteracionCreateDTO {
    private Integer numero;
    private String descripcion;
    private String fechaInicio;
    private String fechaFin;
    private Long etapaId;

    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }
    public Long getEtapaId() { return etapaId; }
    public void setEtapaId(Long etapaId) { this.etapaId = etapaId; }
}

