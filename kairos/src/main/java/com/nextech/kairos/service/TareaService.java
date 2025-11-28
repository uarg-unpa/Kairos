package com.nextech.kairos.service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.repository.TareaRepository;

import jakarta.transaction.Transactional;

@Service
public class TareaService implements ITareaService {

    @Autowired
    private TareaRepository tareaRepository;
    @Autowired
    private IIteracionService iteracionService;

    @Override
    public List<Tarea> listarTareas() {
        return tareaRepository.findAll();
    }

    @Override
    public Tarea obtenerPorId(Long id) {
        return tareaRepository.findById(id).orElse(null);
    }

    @Override
    public Tarea guardarTarea(Tarea tarea) {
        Iteracion iteracion = iteracionService.obtenerPorId(tarea.getIteracion().getIdIteracion())
        .orElseThrow(() -> new IllegalArgumentException("Iteración con ID " + tarea.getIteracion().getIdIteracion() + " no encontrada."));

        LocalDate fechaInicio = tarea.getFechaCreacion();
        LocalDate fechaFin = tarea.getFechaFin();
        if (fechaInicio.isBefore(iteracion.getFechaInicio()) || fechaFin.isAfter(iteracion.getFechaFin())) {
            throw new IllegalArgumentException("Las fechas de la tarea deben estar dentro del rango de la iteración.");
        }
        

        return tareaRepository.save(tarea);
    }

    @Override
    @Transactional
    public void eliminarTarea(Long id) {
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarea con ID " + id + " no encontrada."));

        // 🔹 Limpiar categorías
        tarea.getCategorias().clear();

        // 🔹 Quitar esta tarea de las dependencias de otras tareas
        for (Tarea dependiente : new HashSet<>(tarea.getDependientes())) {
            dependiente.getDependencias().remove(tarea);
        }

        // 🔹 Quitar dependencias propias
        for (Tarea dependencia : new HashSet<>(tarea.getDependencias())) {
            dependencia.getDependientes().remove(tarea);
        }

        tarea.getDependencias().clear();
        tarea.getDependientes().clear();

        // 🔹 Guardar y forzar sincronización antes de eliminar
        tareaRepository.save(tarea);
        tareaRepository.flush(); // 🔸 fuerza UPDATEs antes del DELETE

        // 🔹 Ahora sí eliminar
        tareaRepository.delete(tarea);
    }

    // 🔹 Métodos para horas estimadas
    public List<Tarea> listarPorHorasEstimadas(Double horas) {
        return tareaRepository.findByHorasEstimadas(horas);
    }

    public List<Tarea> listarPorHorasEstimadasMayorQue(Double horas) {
        return tareaRepository.findByHorasEstimadasGreaterThan(horas);
    }

    public List<Tarea> listarPorHorasEstimadasMenorQue(Double horas) {
        return tareaRepository.findByHorasEstimadasLessThan(horas);
    }

    public List<Tarea> obtenerTareasPorUsuarioId(Long usuarioId) {
        return tareaRepository.findByUsuario_Id(usuarioId);
    }

    @Transactional
    public List<Tarea> listarPorProyecto(Long idProyecto) {
        return tareaRepository.findByIteracion_Etapa_Proyecto_IdProyecto(idProyecto);
    }

    public void validarDependenciasCirculares(Long tareaId, List<Long> dependenciasIds) {
    if (dependenciasIds == null || dependenciasIds.isEmpty())
        return;

    for (Long depId : dependenciasIds) {
        if (depId.equals(tareaId)) {
            System.out.println("⚠️ VALIDACIÓN: la tarea " + tareaId + " intenta depender de sí misma");
            throw new IllegalArgumentException("Una tarea no puede depender de sí misma");
        }

        if (tieneDependenciaRecursiva(depId, tareaId)) {
            System.out.println("⚠️ VALIDACIÓN: dependencia circular detectada entre " + tareaId + " y " + depId);
            throw new IllegalArgumentException("Dependencia circular detectada entre tareas");
        }
    }
}

    private boolean tieneDependenciaRecursiva(Long idOrigen, Long idBuscado) {
        Tarea tarea = tareaRepository.findById(idOrigen)
                .orElse(null);
        if (tarea == null || tarea.getDependencias().isEmpty())
            return false;

        for (Tarea dep : tarea.getDependencias()) {
            if (dep.getIdTarea().equals(idBuscado) || tieneDependenciaRecursiva(dep.getIdTarea(), idBuscado)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public List<Tarea> obtenerTareasPorProyectoYIteracion(Long idProyecto, Long idIteracion) {
        return tareaRepository.findByProyectoIdAndIteracionId(idProyecto, idIteracion);
    }

}
