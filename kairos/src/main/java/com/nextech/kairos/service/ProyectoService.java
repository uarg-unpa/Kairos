package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.repository.ProyectoRepository;
import com.nextech.kairos.repository.UsuarioProyectoRepository;

@Service
@Transactional
public class ProyectoService {
    
    private final ProyectoRepository proyectoRepository;
    private final UsuarioProyectoRepository usuarioProyectoRepository;
    private final UsuarioService usuarioService;

    @Autowired
    public ProyectoService(
        ProyectoRepository proyectoRepository,
        UsuarioProyectoRepository usuarioProyectoRepository,
        UsuarioService usuarioService) {
        
        this.proyectoRepository = proyectoRepository;
        this.usuarioProyectoRepository = usuarioProyectoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<Proyecto> findAll() {
        return proyectoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Proyecto> findById(Long idProyecto) {
        return proyectoRepository.findById(idProyecto);
    }
    
    /**
     * crear proyecto
     * @param proyecto El objeto Proyecto a guardar.
     * @return El proyecto guardado con su ID generado.
     */
    public Proyecto create(Proyecto proyecto) {
        if (proyectoRepository.findByNombre(proyecto.getNombre()).isPresent()) {
            throw new RuntimeException("Ya existe un proyecto con el nombre: " + proyecto.getNombre());
        }
        
        if (proyecto.getEstado() == null || proyecto.getEstado().isEmpty()) {
             proyecto.setEstado("PENDIENTE"); //estado inicial por defecto
        }
        
        return proyectoRepository.save(proyecto);
    }

    /**
     * actualizar datos de un proyecto
     * @param idProyecto ID del proyecto a actualizar
     * @param detallesProyecto Datos de cambio (nombre, equipo, estado)
     * @return proyecto actualizado
     */
    public Proyecto update(Long idProyecto, Proyecto detallesProyecto) {
        return proyectoRepository.findById(idProyecto).map(proyectoExistente -> {
            
            // Si cambia el nombre volver a validar que sea unico
            if (!proyectoExistente.getNombre().equals(detallesProyecto.getNombre())) {
                if (proyectoRepository.findByNombre(detallesProyecto.getNombre()).isPresent()) {
                    throw new RuntimeException("El nombre del proyecto ya está en uso.");
                }
                proyectoExistente.setNombre(detallesProyecto.getNombre());
            }
            
            proyectoExistente.setEquipo(detallesProyecto.getEquipo());
            proyectoExistente.setEstado(detallesProyecto.getEstado());
            
            return proyectoRepository.save(proyectoExistente);
            
        }).orElseThrow(() -> new RuntimeException("Proyecto no encontrado con ID: " + idProyecto));
    }

    public void delete(Long idProyecto) {
        // Debido a CascadeType.ALL y orphanRemoval=true en las colecciones
        // (etapas, categorias, reportes, usuariosProyecto), la eliminación del proyecto
        // eliminará todos los elementos relacionados en cascada.
        proyectoRepository.deleteById(idProyecto);
    }

    /**
     * Obtiene la lista de etapas de un proyecto específico.
     */
    @Transactional(readOnly = true)
    public Set<Etapa> getEtapasByProyectoId(Long idProyecto) {
        return proyectoRepository.findById(idProyecto)
            .map(Proyecto::getEtapas)
            .orElseThrow(() -> new RuntimeException("Proyecto no encontrado."));
    }

    /**
     * asigna un miembro a un proyecto con su rol
     * @param idProyecto ID del proyecto.
     * @param idUsuario ID del usuario.
     * @param rol rol que tendrá el miembro en el proyecto (ej: "diseñador", "programador").
     * @return La nueva asignación (UsuarioProyecto).
     */
    public UsuarioProyecto assignUserToProject(Long idProyecto, Long idUsuario, String rol) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
            .orElseThrow(() -> new RuntimeException("Proyecto no encontrado."));
            
        Usuario usuario = usuarioService.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
            
        UsuarioProyecto asignacion = new UsuarioProyecto(usuario, proyecto, rol);
        
        return usuarioProyectoRepository.save(asignacion);
    }
    
    /**
     * Eliminar la asignación de un miembro a un proyecto
     */
    public void removeUserFromProject(Long idProyecto, Long idUsuario) {
        UsuarioProyecto asignacion = usuarioProyectoRepository.findByIdUsuarioIdUsuario(idUsuario).stream()
            .filter(up -> up.getProyecto().getIdProyecto().equals(idProyecto))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Asignación de usuario no encontrada para este proyecto."));
        
        usuarioProyectoRepository.delete(asignacion);
    }

    /**
     * Busca proyectos donde participa un miembro
     */
    @Transactional(readOnly = true)
    public List<Proyecto> findProjectsByUser(Long idUsuario) {
        return proyectoRepository.findByUsuariosProyecto_Usuario_Id(idUsuario);
    }
    
    /**
     * Buscar proyectos
     */
    @Transactional(readOnly = true)
    public List<Proyecto> searchByNombre(String nombre) {
        return proyectoRepository.findByNombreContainingIgnoreCase(nombre);
    }
}