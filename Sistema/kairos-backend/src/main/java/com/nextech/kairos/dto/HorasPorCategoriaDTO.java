package com.nextech.kairos.dto;

public class HorasPorCategoriaDTO {

    private final Long categoriaId;
    private final String categoriaNombre;
    private final Integer minutos;

    public HorasPorCategoriaDTO(Long categoriaId, String categoriaNombre, Integer minutos) {
        this.categoriaId = categoriaId;
        this.categoriaNombre = categoriaNombre;
        this.minutos = minutos;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public String getCategoriaNombre() {
        return categoriaNombre;
    }

    public Integer getMinutos() {
        return minutos;
    }
}
