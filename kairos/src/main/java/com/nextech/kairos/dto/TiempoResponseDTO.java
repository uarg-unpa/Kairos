package com.nextech.kairos.dto;

import java.time.LocalDate;

public class TiempoResponseDTO {
    private Long idTiempo;
    private String nombreTarea;
    private Integer duracionMinutos;
    private LocalDate fechaRegistro;
    private String descripcion;

    public TiempoResponseDTO() {}

    public TiempoResponseDTO(Long idTiempo, String nombreTarea, Integer duracionMinutos, 
                           LocalDate fechaRegistro, String descripcion) {
        this.idTiempo = idTiempo;
        this.nombreTarea = nombreTarea;
        this.duracionMinutos = duracionMinutos;
        this.fechaRegistro = fechaRegistro;
        this.descripcion = descripcion;
    }

    // Getters y Setters
    public Long getIdTiempo() { return idTiempo; }
    public void setIdTiempo(Long idTiempo) { this.idTiempo = idTiempo; }
    public String getNombreTarea() { return nombreTarea; }
    public void setNombreTarea(String nombreTarea) { this.nombreTarea = nombreTarea; }
    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }
    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}