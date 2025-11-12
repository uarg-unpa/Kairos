package com.nextech.kairos.mapper;

import com.nextech.kairos.dto.EtapaDTO;
import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Iteracion;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class EtapaMapper {
    public static EtapaDTO toDTO(Etapa e) {
        if (e == null) return null;

        int progreso = calcularProgresoEtapa(e);
        Integer iteraciones = e.getIteraciones() != null ? e.getIteraciones().size() : 0;

        return new EtapaDTO(
            e.getIdEtapa(),
            e.getNombre(),
            e.getDescripcion(),
            e.getEstado() != null ? e.getEstado().name() : null,
            e.getFechaInicio() != null ? e.getFechaInicio().toString() : null,
            e.getFechaFin() != null ? e.getFechaFin().toString() : null,
            (e.getProyecto() != null ? e.getProyecto().getIdProyecto() : null),
            progreso,
            iteraciones
        );
    }

    private static int calcularProgresoEtapa(Etapa e) {
        LocalDate hoy = LocalDate.now();
        LocalDate finEtapa = e.getFechaFin();
        if (finEtapa != null && !hoy.isBefore(finEtapa)) {
            // La etapa ya expiró por fecha: considerar 100%
            return 100;
        }

        if (e.getIteraciones() == null || e.getIteraciones().isEmpty()) {
            return 0;
        }
        return (int) Math.round(
            e.getIteraciones().stream()
                .mapToInt(EtapaMapper::progresoIteracionPorFechas)
                .average()
                .orElse(0.0)
        );
    }

    private static int progresoIteracionPorFechas(Iteracion it) {
        LocalDate ini = it.getFechaInicio();
        LocalDate fin = it.getFechaFin();
        if (ini == null || fin == null || !fin.isAfter(ini)) {
            return 0;
        }
        LocalDate hoy = LocalDate.now();
        if (!hoy.isAfter(ini)) {
            return 0;
        }
        if (!hoy.isBefore(fin)) {
            return 100;
        }
        long total = ChronoUnit.DAYS.between(ini, fin);
        long hecho = Math.max(0, ChronoUnit.DAYS.between(ini, hoy));
        int pct = (int) Math.round((hecho * 100.0) / Math.max(1, total));
        if (pct < 0) return 0;
        if (pct > 100) return 100;
        return pct;
    }
}
