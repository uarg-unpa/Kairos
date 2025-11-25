package com.nextech.kairos.dto;

public class HorasPorIteracionDTO {
    private Long iteracionId;
    private Integer numero;
    private Integer minutos;

    public HorasPorIteracionDTO(Long iteracionId, Integer numero, Integer minutos) {
        this.iteracionId = iteracionId;
        this.numero = numero;
        this.minutos = minutos;
    }

    public Long getIteracionId() { return iteracionId; }
    public Integer getNumero() { return numero; }
    public Integer getMinutos() { return minutos; }
}

