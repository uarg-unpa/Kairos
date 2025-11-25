package com.nextech.kairos.service;

import java.util.List;
import com.nextech.kairos.model.Tarea;
import java.util.Optional;


public interface ITareaService {

    // 🔹 Métodos básicos
    List<Tarea> listarTareas();
    Tarea obtenerPorId(Long id);
    Tarea guardarTarea(Tarea tarea);
    void eliminarTarea(Long id);


    // 🔹 Métodos para horas estimadas
    List<Tarea> listarPorHorasEstimadas(Double horas);
    List<Tarea> listarPorHorasEstimadasMayorQue(Double horas);
    List<Tarea> listarPorHorasEstimadasMenorQue(Double horas);
    // 🔹 Nuevo método para obtener tareas por proyecto e iteración
    List<Tarea> obtenerTareasPorProyectoYIteracion(Long idProyecto, Long idIteracion);
}

