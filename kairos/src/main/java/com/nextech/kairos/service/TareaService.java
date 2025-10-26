package com.nextech.kairos.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.repository.TareaReporsitory;

@Service
public class TareaService implements ITareaService {

    @Autowired
    private TareaReporsitory tareaRepository;

    @Override
    public List<Tarea> listarTareas() {
        return tareaRepository.findAll();
    }

    @Override
    public Tarea obtenerPorId(Integer id) {
        return tareaRepository.findById(id).orElse(null);
    }

    @Override
    public Tarea guardarTarea(Tarea tarea) {
        return tareaRepository.save(tarea);
    }

    @Override
    public void eliminarTarea(Integer id) {
        tareaRepository.deleteById(id);
    }
}


