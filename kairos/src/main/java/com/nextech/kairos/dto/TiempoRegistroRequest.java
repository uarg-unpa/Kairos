package com.nextech.kairos.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

/**
 * DTO para recibir el registro de tiempo finalizado desde el frontend (cronómetro o manual)
 */
public class TiempoRegistroRequest {
    
    private Long idTarea;
    
    private Long idTareaPersonal;
    
    @NotNull
    private Integer duracionSegundos; 
    private LocalDate fechaRegistro; 
//opcional este
    private String descripcion; 

    public Long getIdTarea() { return idTarea; }
    public void setIdTarea(Long idTarea) { this.idTarea = idTarea; }
    public Long getIdTareaPersonal() { return idTareaPersonal; }
    public void setIdTareaPersonal(Long idTareaPersonal) { this.idTareaPersonal = idTareaPersonal; }
    public Integer getDuracionSegundos() { return duracionSegundos; }
    public void setDuracionSegundos(Integer duracionSegundos) { this.duracionSegundos = duracionSegundos; }
    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
