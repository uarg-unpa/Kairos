package com.nextech.kairos.dto;

import java.time.LocalDate;

public class HorasPorDiaTareaDTO {

    private final LocalDate fecha;
    private final Long tareaId;
    private final String tareaNombre;
    private final Integer minutos;

    public HorasPorDiaTareaDTO(LocalDate fecha, Long tareaId, String tareaNombre, Integer minutos) {
        this.fecha = fecha;
        this.tareaId = tareaId;
        this.tareaNombre = tareaNombre;
        this.minutos = minutos;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public Long getTareaId() {
        return tareaId;
    }

    public String getTareaNombre() {
        return tareaNombre;
    }

    public Integer getMinutos() {
        return minutos;
    }
}
