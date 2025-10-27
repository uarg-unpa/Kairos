package com.nextech.kairos.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.repository.TareaRepository;

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
    public void eliminarTarea(Long id) {
        tareaRepository.deleteById(id);
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
}
