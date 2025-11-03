package com.nextech.kairos.mapper;

import com.nextech.kairos.dto.EtapaDTO;
import com.nextech.kairos.model.Etapa;

public class EtapaMapper {
    public static EtapaDTO toDTO(Etapa etapa) {
        if (etapa == null) return null;
        int iteraciones = etapa.getIteraciones() != null ? etapa.getIteraciones().size() : 0;
        return new EtapaDTO(
            etapa.getIdEtapa(),
            etapa.getNombre(),
            etapa.getDescripcion(),
            etapa.getFechaInicio() != null ? etapa.getFechaInicio().toString() : null,
            etapa.getFechaFin() != null ? etapa.getFechaFin().toString() : null,
            iteraciones
        );
    }
}
