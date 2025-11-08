package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.UsuarioProyecto;

public interface IProyectoService {

    /**
     * Obtiene todos los proyectos.
     * @return Lista de proyectos.
     */
    List<Proyecto> findAll();

    /**
     * Busca un proyecto por su ID.
     * @param idProyecto ID del proyecto.
     * @return Proyecto encontrado, si existe.
     */
    Optional<Proyecto> findById(Long idProyecto);

    /**
     * Crea un nuevo proyecto.
     * @param proyecto El objeto Proyecto a guardar.
     * @return El proyecto guardado con su ID generado.
     */
    Proyecto create(Proyecto proyecto);

    /**
     * Actualiza los datos de un proyecto existente.
     * @param idProyecto ID del proyecto a actualizar.
     * @param detallesProyecto Datos de cambio (nombre, equipo, estado).
     * @return Proyecto actualizado.
     */
    Proyecto update(Long idProyecto, Proyecto detallesProyecto);

    /**
     * Elimina un proyecto por su ID.
     * @param idProyecto ID del proyecto a eliminar.
     */
    void delete(Long idProyecto);

    /**
     * Obtiene la lista de etapas de un proyecto específico.
     * @param idProyecto ID del proyecto.
     * @return Conjunto de etapas asociadas.
     */
    Set<Etapa> getEtapasByProyectoId(Long idProyecto);

    /**
     * Asigna un usuario a un proyecto con un rol determinado.
     * @param idProyecto ID del proyecto.
     * @param idUsuario ID del usuario.
     * @param rol Rol asignado dentro del proyecto.
     * @return La asignación creada.
     */
    UsuarioProyecto assignUserToProject(Long idProyecto, Long idUsuario, String rol);

    /**
     * Elimina la asignación de un usuario dentro de un proyecto.
     * @param idProyecto ID del proyecto.
     * @param idUsuario ID del usuario.
     */
    void removeUserFromProject(Long idProyecto, Long idUsuario);

    /**
     * Busca los proyectos en los que participa un usuario.
     * @param idUsuario ID del usuario.
     * @return Lista de proyectos asociados.
     */
    List<Proyecto> findProjectsByUser(Long idUsuario);

    /**
     * Busca proyectos por nombre (coincidencia parcial, sin distinción de mayúsculas/minúsculas).
     * @param nombre Nombre o parte del nombre del proyecto.
     * @return Lista de proyectos coincidentes.
     */
    List<Proyecto> searchByNombre(String nombre);
}
