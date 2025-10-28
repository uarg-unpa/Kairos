package com.nextech.kairos.dto;

import jakarta.validation.constraints.NotNull;

public class TiempoActivoStartRequest {

    @NotNull
    private Long idTarea;

    public Long getIdTarea() { return idTarea; }
    public void setIdTarea(Long idTarea) { this.idTarea = idTarea; }
}

