package com.nextech.kairos.service;


import java.util.List;
import com.nextech.kairos.model.Tarea;

public interface ITareaService {
    List<Tarea> listarTareas();
    Tarea obtenerPorId(Integer id);
    Tarea guardarTarea(Tarea tarea);
    void eliminarTarea(Integer id);
}
