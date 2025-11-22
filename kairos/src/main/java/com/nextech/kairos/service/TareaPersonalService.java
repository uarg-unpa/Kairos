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

    @Autowired
    private com.nextech.kairos.repository.UsuarioRepository usuarioRepository;

    public TareaPersonal crearTareaPersonal(Usuario usuario, String nombre, String descripcion) {
        Usuario managedUsuario = usuarioRepository.findById(usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        TareaPersonal tarea = new TareaPersonal(managedUsuario, nombre, descripcion, LocalDate.now(), "BORRADOR");
        return tareaPersonalRepository.save(tarea);
    }

    public TareaPersonal crearTareaPersonal(TareaPersonal tareaPersonal, Usuario usuario) {
        Usuario managedUsuario = usuarioRepository.findById(usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        tareaPersonal.setUsuario(managedUsuario);
        tareaPersonal.setFechaCreacion(LocalDate.now());
        if (tareaPersonal.getEstado() == null) {
            tareaPersonal.setEstado("BORRADOR");
        }
        return tareaPersonalRepository.save(tareaPersonal);
    }

    public List<TareaPersonal> getTareasPersonalesPorUsuario(Usuario usuario) {
        return tareaPersonalRepository.findByUsuario(usuario);
    }

    public TareaPersonal proponerTarea(Long id, Long proyectoId, Long categoriaId) {
        TareaPersonal tarea = tareaPersonalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        
        tarea.setProyectoPropuestoId(proyectoId);
        tarea.setCategoriaPropuestaId(categoriaId);
        tarea.setEstado("PROPUESTA");
        
        return tareaPersonalRepository.save(tarea);
    }

    public List<TareaPersonal> getTareasPropuestasPorProyecto(Long projectId) {
        return tareaPersonalRepository.findByProyectoPropuestoIdAndEstado(projectId, "PROPUESTA");
    }
    
    public void eliminarTareaPersonal(Long id) {
        tareaPersonalRepository.deleteById(id);
    }
    
    public TareaPersonal getTareaPersonalPorId(Long id) {
         return tareaPersonalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
    }

    public void rechazarTarea(Long id) {
        TareaPersonal tarea = tareaPersonalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        tarea.setEstado("RECHAZADA");
        tareaPersonalRepository.save(tarea);
    }
}
