package com.nextech.kairos.service;

import java.util.List;
import com.nextech.kairos.model.Iteracion;

public interface IIteracionService {
    List<Iteracion> listarIteraciones();
    Iteracion obtenerPorId(Long id);
    Iteracion guardarIteracion(Iteracion iteracion);
    void eliminarIteracion(Long id);
    List<Iteracion> listarPorEtapa(Long idEtapa);
    List<Iteracion> listarPorProyecto(Long idProyecto);
    Iteracion obtenerIteracionActualPorProyecto(Long idProyecto);
}
