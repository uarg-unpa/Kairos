package com.nextech.kairos.mapper;
import com.nextech.kairos.dto.IteracionRequest;
import com.nextech.kairos.dto.IteracionResponse;
import com.nextech.kairos.model.Iteracion;

public class IteracionMapper {
    public static IteracionResponse toResponse(Iteracion iteracion) {
        if (iteracion == null) return null;
        return new IteracionResponse(
            iteracion.getIdIteracion(),
            iteracion.getNumero(),
            iteracion.getFechaInicio() != null ? iteracion.getFechaInicio().toString() : null,
            iteracion.getFechaFin() != null ? iteracion.getFechaFin().toString() : null,
            iteracion.getDescripcion(), iteracion.getEtapa().getIdEtapa()
        );
    }

    public static Iteracion toEntity(IteracionRequest request) {
        if (request == null) return null;
        Iteracion iteracion = new Iteracion();
        iteracion.setNumero(request.getNumero());
        iteracion.setDescripcion(request.getDescripcion());
        if (request.getFechaInicio() != null) {
            iteracion.setFechaInicio(new java.sql.Date(request.getFechaInicio().getTime()).toLocalDate());
        }
        if (request.getFechaFin() != null) {
            iteracion.setFechaFin(new java.sql.Date(request.getFechaFin().getTime()).toLocalDate());
        }
        return iteracion;
    }
}
