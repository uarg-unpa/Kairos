package com.nextech.kairos.dto;

public class TareaPersonalCreateDTO {
    private String nombre;
    private String descripcion;
    private Double horasEstimadas;

    public TareaPersonalCreateDTO() {
    }

    public TareaPersonalCreateDTO(String nombre, String descripcion, Double horasEstimadas) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.horasEstimadas = horasEstimadas;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getHorasEstimadas() {
        return horasEstimadas;
    }

    public void setHorasEstimadas(Double horasEstimadas) {
        this.horasEstimadas = horasEstimadas;
    }
}
