package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Comentario;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Tiempo;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.CategoriaRepository;
import com.nextech.kairos.repository.IteracionRepository;
import com.nextech.kairos.repository.TareaRepository;
import com.nextech.kairos.repository.UsuarioRepository;

@Service
@Transactional 
public class TareaService {
    
    // Inyección de dependencias (Repositorios)
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final IteracionRepository iteracionRepository;
    private final CategoriaRepository categoriaRepository;

    @Autowired
    public TareaService(
        TareaRepository tareaRepository,
        UsuarioRepository usuarioRepository,
        IteracionRepository iteracionRepository,
        CategoriaRepository categoriaRepository) {
        
        this.tareaRepository = tareaRepository;
        this.usuarioRepository = usuarioRepository;
        this.iteracionRepository = iteracionRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Tarea> findAll() {
        return tareaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Tarea> findById(Long idTarea) {
        return tareaRepository.findById(idTarea);
    }
    
    /**
     * Crea una nueva tarea y la asocia a una iteración.
     */
    public Tarea createTarea(Tarea tarea, Long idIteracion) {
        Iteracion iteracion = iteracionRepository.findById(idIteracion)
            .orElseThrow(() -> new RuntimeException("Iteración no encontrada con ID: " + idIteracion));
        
        tarea.setIteracion(iteracion);
        
        if (tarea.getEstado() == null || tarea.getEstado().isEmpty()) {
            tarea.setEstado("PENDIENTE");
        }
        
        return tareaRepository.save(tarea);
    }

    /**
     * Actualiza una tarea existente.
     */
    public Tarea updateTarea(Long idTarea, Tarea detallesTarea) {
        return tareaRepository.findById(idTarea).map(tareaExistente -> {
            tareaExistente.setNombre(detallesTarea.getNombre());
            tareaExistente.setDescripcion(detallesTarea.getDescripcion());
            tareaExistente.setEstado(detallesTarea.getEstado());
            tareaExistente.setPrioridad(detallesTarea.getPrioridad());
            tareaExistente.setFechaFin(detallesTarea.getFechaFin());
            
            return tareaRepository.save(tareaExistente);
            
        }).orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + idTarea));
    }

    public void delete(Long idTarea) {
        tareaRepository.deleteById(idTarea);
    }

    /**
     * Asigna un miembro a la tarea
     */
    public Tarea assignUser(Long idTarea, Long idUsuario) {
        Tarea tarea = findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada."));
            
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
            
        tarea.setUsuarioAsignado(usuario);
        return tareaRepository.save(tarea);
    }
    
    /**
     * Desasigna el miembro de la tarea.
     */
    public Tarea unassignUser(Long idTarea) {
        Tarea tarea = findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada."));
            
        tarea.setUsuarioAsignado(null);
        return tareaRepository.save(tarea);
    }
    
    /**
     * Asigna una categoría a la tarea
     */
    public Tarea addCategoria(Long idTarea, Long idCategoria) {
        Tarea tarea = findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada."));
            
        Categoria categoria = categoriaRepository.findById(idCategoria)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada."));
            
        tarea.getCategorias().add(categoria);
        return tareaRepository.save(tarea);
    }

    /**
     * Tarea depende de otra tarea
     */
    public Tarea addDependencia(Long idTarea, Long idTareaDepende) {
        if (idTarea.equals(idTareaDepende)) {
            throw new RuntimeException("Una tarea no puede depender de sí misma.");
        }
        
        Tarea tarea = findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea principal no encontrada."));
            
        Tarea tareaDepende = findById(idTareaDepende)
            .orElseThrow(() -> new RuntimeException("Tarea de dependencia no encontrada."));
            
        tarea.getTareasDependencia().add(tareaDepende);
        return tareaRepository.save(tarea);
    }

    @Transactional(readOnly = true)
    public List<Tarea> findTareasByIteracion(Long idIteracion) {
        return tareaRepository.findByIteracionIdIteracion(idIteracion);
    }

    // MÉTODO CLAVE PARA EL WORKSPACE: ESTE FALTABA EN TU CÓDIGO
    @Transactional(readOnly = true)
    public List<Tarea> findTareasAsignadasAUsuario(Long idUsuario) {
        return tareaRepository.findByUsuarioAsignadoId(idUsuario);
    }
    
    @Transactional(readOnly = true)
    public Set<Comentario> getComentariosByTareaId(Long idTarea) {
        Tarea tarea = findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada."));
        return tarea.getComentarios(); 
    }
    
    @Transactional(readOnly = true)
    public Set<Tiempo> getTiemposRegistrados(Long idTarea) {
        Tarea tarea = findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada."));
        return tarea.getTiempos(); 
    }
    
    @Transactional(readOnly = true)
    public Set<Tarea> getTareasDependientes(Long idTarea) {
        Tarea tarea = findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada."));
        return tarea.getTareasDependientes(); 
    }
}
