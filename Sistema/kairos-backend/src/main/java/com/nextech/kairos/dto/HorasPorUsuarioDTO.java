package com.nextech.kairos.dto;

public class HorasPorUsuarioDTO {
    private Long usuarioId;
    private String usuarioNombre;
    private Integer minutos;

    public HorasPorUsuarioDTO(Long usuarioId, String usuarioNombre, Integer minutos) {
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.minutos = minutos;
    }

    public Long getUsuarioId() { return usuarioId; }
    public String getUsuarioNombre() { return usuarioNombre; }
    public Integer getMinutos() { return minutos; }
}

