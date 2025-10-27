package com.nextech.kairos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Comentario;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.ComentarioRepository;
import com.nextech.kairos.repository.TareaRepository;  
import com.nextech.kairos.repository.UsuarioRepository; 

@Service
@Transactional 
public class ComentarioService {
    
    private final ComentarioRepository comentarioRepository;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public ComentarioService(
        ComentarioRepository comentarioRepository,
        TareaRepository tareaRepository,
        UsuarioRepository usuarioRepository) {
        
        this.comentarioRepository = comentarioRepository;
        this.tareaRepository = tareaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Comentario> findAll() {
        return comentarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Comentario> findById(Long idComentario) {
        return comentarioRepository.findById(idComentario);
    }
    
    /**
     * Crea un nuevo comentario asociado a una tarea y un usuario
     * @param comentario Objeto Comentario con el contenido.
     * @param idTarea ID de la tarea a comentar (obligatoria).
     * @param idUsuario ID del usuario que comenta (opcional, puede ser null).
     * @return El comentario guardado.
     */
    public Comentario createComentario(Comentario comentario, Long idTarea, Long idUsuario) {
        Tarea tarea = tareaRepository.findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + idTarea));
        Usuario usuario = null;
        if (idUsuario != null) {
            usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        }
        if (comentario.getContenido() == null || comentario.getContenido().trim().isEmpty()) {
            throw new RuntimeException("El contenido del comentario no puede estar vacío.");
        }
        if (comentario.getFechaComentario() == null) {
            comentario.setFechaComentario(LocalDate.now());
        }
        comentario.setTarea(tarea);
        comentario.setUsuario(usuario);
        
        return comentarioRepository.save(comentario);
    }
    // ##################### Actualizar comentario?? pendiente..###########################
    // /**
    //  * Actualiza el contenido de un comentario existente.
    //  */
    // public Comentario updateContenido(Long idComentario, String nuevoContenido) {
    //     return comentarioRepository.findById(idComentario).map(comentarioExistente -> {
            
    //         if (nuevoContenido == null || nuevoContenido.trim().isEmpty()) {
    //             throw new RuntimeException("El contenido del comentario no puede estar vacío.");
    //         }
            
    //         comentarioExistente.setContenido(nuevoContenido);
            
    //         return comentarioRepository.save(comentarioExistente);
            
    //     }).orElseThrow(() -> new RuntimeException("Comentario no encontrado con ID: " + idComentario));
    // }

    public void delete(Long idComentario) {
        comentarioRepository.deleteById(idComentario);
    }
    @Transactional(readOnly = true)
    public List<Comentario> findComentariosByTarea(Long idTarea) {
        return comentarioRepository.findByTareaIdTarea(idTarea);
    }

    @Transactional(readOnly = true)
    public List<Comentario> findComentariosByUsuario(Long idUsuario) {
        return comentarioRepository.findByUsuarioId(idUsuario);
    }

    @Transactional(readOnly = true)
    public List<Comentario> findComentariosByTareaOrderedByDate(Long idTarea) {
        return comentarioRepository.findByTareaIdTareaOrderByFechaComentarioDesc(idTarea);
    }
}