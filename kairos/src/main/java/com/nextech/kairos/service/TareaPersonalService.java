package com.nextech.kairos.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nextech.kairos.model.TareaPersonal;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.TareaPersonalRepository;

@Service
public class TareaPersonalService {

    @Autowired
    private TareaPersonalRepository tareaPersonalRepository;

    public TareaPersonal createPersonalTask(Usuario usuario, String nombre, String descripcion) {
        TareaPersonal tarea = new TareaPersonal(usuario, nombre, descripcion, LocalDate.now(), "BORRADOR");
        return tareaPersonalRepository.save(tarea);
    }

    public TareaPersonal createPersonalTask(TareaPersonal tareaPersonal, Usuario usuario) {
        tareaPersonal.setUsuario(usuario);
        tareaPersonal.setFechaCreacion(LocalDate.now());
        if (tareaPersonal.getEstado() == null) {
            tareaPersonal.setEstado("BORRADOR");
        }
        return tareaPersonalRepository.save(tareaPersonal);
    }

    public List<TareaPersonal> getPersonalTasksByUser(Usuario usuario) {
        return tareaPersonalRepository.findByUsuario(usuario);
    }

    public TareaPersonal proposeTask(Long id, Long proyectoId, Long categoriaId) {
        TareaPersonal tarea = tareaPersonalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        
        tarea.setProyectoPropuestoId(proyectoId);
        tarea.setCategoriaPropuestaId(categoriaId);
        tarea.setEstado("PROPUESTA");
        
        return tareaPersonalRepository.save(tarea);
    }

    public List<TareaPersonal> getProposedTasksByProject(Long projectId) {
        return tareaPersonalRepository.findByProyectoPropuestoIdAndEstado(projectId, "PROPUESTA");
    }
    
    public void deletePersonalTask(Long id) {
        tareaPersonalRepository.deleteById(id);
    }
    
    public TareaPersonal getPersonalTaskById(Long id) {
         return tareaPersonalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
    }

    public void rejectTask(Long id) {
        TareaPersonal tarea = tareaPersonalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        tarea.setEstado("RECHAZADA");
        tareaPersonalRepository.save(tarea);
    }
}
