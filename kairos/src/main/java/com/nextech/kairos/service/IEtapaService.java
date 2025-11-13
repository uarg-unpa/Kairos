package com.nextech.kairos.service;

import java.util.List;
import com.nextech.kairos.model.Etapa;

public interface IEtapaService {
    List<Etapa> listar();
    List<Etapa> listarPorProyecto(Long idProyecto);
    Etapa obtener(Long id);
    Etapa guardar(Etapa etapa);
    void eliminar(Long id);
    Etapa obtenerEtapaActualPorProyecto(Long idProyecto);
}
