package com.nextech.kairos.dto;

public class HorasPorEtapaDTO {

    private final Long etapaId;
    private final String etapaNombre;
    private final Integer minutos;

    public HorasPorEtapaDTO(Long etapaId, String etapaNombre, Integer minutos) {
        this.etapaId = etapaId;
        this.etapaNombre = etapaNombre;
        this.minutos = minutos;
    }

    public Long getEtapaId() {
        return etapaId;
    }

    public String getEtapaNombre() {
        return etapaNombre;
    }

    public Integer getMinutos() {
        return minutos;
    }
}
