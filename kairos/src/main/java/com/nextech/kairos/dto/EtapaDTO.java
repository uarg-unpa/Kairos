package com.nextech.kairos.dto;

public class EtapaDTO {
    private long idEtapa;
    private String nombre;
    private String descripcion;
    private String fechaInicio;
    private String fechaFin;
    private int iteraciones;

    public EtapaDTO() {}

    public EtapaDTO(long idEtapa, String nombre, String descripcion, String fechaInicio, String fechaFin, int iteraciones) {
        this.idEtapa = idEtapa;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.iteraciones = iteraciones;
    }

    public long getIdEtapa() { return idEtapa; }
    public void setIdEtapa(long idEtapa) { this.idEtapa = idEtapa; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }
    public int getIteraciones() { return iteraciones; }
    public void setIteraciones(int iteraciones) { this.iteraciones = iteraciones; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
