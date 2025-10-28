package com.nextech.kairos.dto;

import java.time.LocalDateTime;

/**
 * Respuesta con datos del cronómetro activo: id, usuario, tarea e inicio.
 */
public class TiempoActivoResponse {
    private Long idTiempoActivo;
    private Long idUsuario;
    private Long idTarea;
    private LocalDateTime inicio;

    public TiempoActivoResponse(Long idTiempoActivo, Long idUsuario, Long idTarea, LocalDateTime inicio) {
        this.idTiempoActivo = idTiempoActivo;
        this.idUsuario = idUsuario;
        this.idTarea = idTarea;
        this.inicio = inicio;
    }

    public Long getIdTiempoActivo() { return idTiempoActivo; }
    public Long getIdUsuario() { return idUsuario; }
    public Long getIdTarea() { return idTarea; }
    public LocalDateTime getInicio() { return inicio; }
}
