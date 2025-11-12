package com.nextech.kairos.dto;

public class EtapaDTO {
    private Long idEtapa;
    private String nombre;
    private String descripcion;
    private String estado;
    private String fechaInicio;
    private String fechaFin;
    private Long proyectoId;
    private Integer progreso; // 0-100
    private Integer iteraciones; // cantidad

    public EtapaDTO() {}

    public EtapaDTO(Long idEtapa, String nombre, String descripcion, String estado,
                    String fechaInicio, String fechaFin, Long proyectoId,
                    Integer progreso, Integer iteraciones) {
        this.idEtapa = idEtapa;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.estado = estado;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.proyectoId = proyectoId;
        this.progreso = progreso;
        this.iteraciones = iteraciones;
    }

    public Long getIdEtapa() { return idEtapa; }
    public void setIdEtapa(Long idEtapa) { this.idEtapa = idEtapa; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }
    public Long getProyectoId() { return proyectoId; }
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }
    public Integer getProgreso() { return progreso; }
    public void setProgreso(Integer progreso) { this.progreso = progreso; }
    public Integer getIteraciones() { return iteraciones; }
    public void setIteraciones(Integer iteraciones) { this.iteraciones = iteraciones; }
}
