package com.nextech.kairos.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public class TiempoEditRequestDTO {
    @NotNull
    private Integer duracionMinutos;

    @NotNull
    private LocalDate fechaRegistro;

    private String descripcion;

    // Getters y Setters
    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }
    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}