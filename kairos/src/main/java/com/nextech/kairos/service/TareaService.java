package com.nextech.kairos.service;

import java.util.HashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.repository.TareaRepository;

import jakarta.transaction.Transactional;

@Service
public class TareaService implements ITareaService {

    @Autowired
    private TareaRepository tareaRepository;

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

}
