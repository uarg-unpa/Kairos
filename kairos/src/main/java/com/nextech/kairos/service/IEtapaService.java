package com.nextech.kairos.service;

import java.util.List;

import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Iteracion;

public interface IEtapaService {
    List<Etapa> listarEtapas();
    List<Etapa> listarPorProyecto(Long idProyecto);
    Etapa obtenerPorId(Long id);
    Etapa guardar(Etapa etapa);
    void eliminar(Long id);
    List<Iteracion> listarIteracionesPorEtapa(Long idEtapa);
}

