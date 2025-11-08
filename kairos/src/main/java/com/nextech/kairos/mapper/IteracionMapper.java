package com.nextech.kairos.mapper;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.dto.IteracionDTO;

public class IteracionMapper {
    public static IteracionDTO toDTO(Iteracion iteracion) {
        if (iteracion == null) return null;
        return new IteracionDTO(
            iteracion.getIdIteracion(),
            iteracion.getNumero(),
            iteracion.getFechaInicio() != null ? iteracion.getFechaInicio().toString() : null,
            iteracion.getFechaFin() != null ? iteracion.getFechaFin().toString() : null,
            iteracion.getDescripcion()
        );
    }
}
