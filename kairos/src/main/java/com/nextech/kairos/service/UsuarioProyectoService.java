package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.model.UsuarioProyectoId;
import com.nextech.kairos.repository.ProyectoRepository;
import com.nextech.kairos.repository.UsuarioProyectoRepository;
import com.nextech.kairos.repository.UsuarioRepository;

@Service
@Transactional 
public class UsuarioProyectoService {
    
    private final UsuarioProyectoRepository usuarioProyectoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProyectoRepository proyectoRepository;

    @Autowired
    public UsuarioProyectoService(
        UsuarioProyectoRepository usuarioProyectoRepository,
        UsuarioRepository usuarioRepository,
        ProyectoRepository proyectoRepository) {
        
        this.usuarioProyectoRepository = usuarioProyectoRepository;
        this.usuarioRepository = usuarioRepository;
        this.proyectoRepository = proyectoRepository;
    }
    /**
     * Busca una asignación específica por la clave compuesta 
     */
    @Transactional(readOnly = true)
    public Optional<UsuarioProyecto> findById(Long idUsuario, Long idProyecto) {
        UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
        return usuarioProyectoRepository.findById(id);
    }
    
    /**
     * Crea o actualiza una asignación de usuario a un proyecto
     * Si la asignación ya existe actualiza el rol, sino la crea
     */
    public UsuarioProyecto saveOrUpdateAssignment(Long idUsuario, Long idProyecto, String rol) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
            
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
            .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con ID: " + idProyecto));
            
        UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
        
        return usuarioProyectoRepository.findById(id).map(asignacionExistente -> {
            // Si existe actualizar el rol
            asignacionExistente.setRolProyecto(rol);
            return usuarioProyectoRepository.save(asignacionExistente);
        }).orElseGet(() -> {
            // Si no existe crear una nueva asignación
            UsuarioProyecto nuevaAsignacion = new UsuarioProyecto(usuario, proyecto, rol);
            return usuarioProyectoRepository.save(nuevaAsignacion);
        });
    }

    /**
     * desvincular un miembro de un proyecto
     */
    public void deleteAssignment(Long idUsuario, Long idProyecto) {
        UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
        if (!usuarioProyectoRepository.existsById(id)) {
            throw new RuntimeException("Asignación no encontrada para el Usuario " + idUsuario + " y Proyecto " + idProyecto);
        }
        usuarioProyectoRepository.deleteById(id);
    }
    @Transactional(readOnly = true)
    public List<UsuarioProyecto> findAssignmentsByProject(Long idProyecto) {
        return usuarioProyectoRepository.findByIdProyectoIdProyecto(idProyecto);
    }

    @Transactional(readOnly = true)
    public List<UsuarioProyecto> findAssignmentsByUser(Long idUsuario) {
        return usuarioProyectoRepository.findByIdUsuarioIdUsuario(idUsuario);
    }
    
    /**
     * Obtiene todos los miembros que tienen un rol específico en cualquier proyecto
     */
    @Transactional(readOnly = true)
    public List<UsuarioProyecto> findAssignmentsByRole(String rolProyecto) {
        return usuarioProyectoRepository.findByRolProyecto(rolProyecto);
    }
    
    /**
     * Obtiene el rol específico de un miembro en un proyecto
     */
    @Transactional(readOnly = true)
    public String getRolProyectoForUser(Long idUsuario, Long idProyecto) {
        String rol = usuarioProyectoRepository.findRolProyectoByIds(idUsuario, idProyecto);
        return rol != null ? rol : "No Asignado";
    }
}