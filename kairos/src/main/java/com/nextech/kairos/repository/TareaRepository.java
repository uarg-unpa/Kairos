package com.nextech.kairos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Tarea;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
// Buscar tareas por su nombre (ignorando mayúsculas/minúsculas)
    @Query("SELECT t FROM Tarea t WHERE LOWER(t.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Tarea> findByNombreContainingIgnoreCase(String nombre);
    
    @Query("SELECT t FROM Tarea t WHERE t.estado = :estado") 
    List<Tarea> findByEstado(String estado);
    
    @Query("SELECT t FROM Tarea t WHERE t.prioridad = :prioridad")
    List<Tarea> findByPrioridad(String prioridad);
    
    @Query("SELECT t FROM Tarea t WHERE t.usuarioAsignado.id = :idUsuario") 
    List<Tarea> findByUsuarioAsignadoId(Long idUsuario);
    
    @Query("SELECT t FROM Tarea t WHERE t.iteracion.idIteracion = :idIteracion") 
    List<Tarea> findByIteracionIdIteracion(Long idIteracion);
    
    @Query("SELECT t FROM Tarea t JOIN t.categorias c WHERE c.nombre = :nombreCategoria")
    List<Tarea> findByCategorias_Nombre(String nombreCategoria);
    
    @Query("SELECT COUNT(t) FROM Tarea t WHERE t.usuarioAsignado.id = :idUsuario AND t.estado = :estado")
    long countByUsuarioAsignadoIdAndEstado(Long idUsuario, String estado);
    
    // Buscar tareas que dependen de otra tarea específica
    // List<Tarea> findByTareasDependencia_IdTarea(Long idTareaDependiente);
    /* @Query("SELECT t FROM Tarea t JOIN t.tareasDependencia td WHERE td.idTarea = :idTareaDepende")
    List<Tarea> findTareasQueDependenDe(@Param("idTareaDepende") Long idTareaDepende);
    */
}