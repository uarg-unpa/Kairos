package com.nextech.kairos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Tarea;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    // --- Métodos de consulta personalizados comunes (Derived Query Methods) ---

    // Buscar tareas por su nombre (ignorando mayúsculas/minúsculas)
    List<Tarea> findByNombreContainingIgnoreCase(String nombre);

    // Buscar tareas por un estado específico (ej: "PENDIENTE", "EN PROGRESO")
    List<Tarea> findByEstado(String estado);
    
    // Buscar tareas por una prioridad específica
    List<Tarea> findByPrioridad(String prioridad);
    
    // Buscar todas las tareas asignadas a un usuario específico (usando la relación ManyToOne)
    // El 'Usuario' es el objeto, pero Spring Data JPA usa el ID de la relación por defecto.
    List<Tarea> findByUsuarioAsignadoId(Long idUsuario);

    // Buscar tareas de una iteración específica (usando la relación ManyToOne)
    List<Tarea> findByIteracionIdIteracion(Long idIteracion);

    // Buscar tareas que contengan una categoría específica
    // Spring Data JPA puede manejar consultas a través de colecciones ManyToMany
    List<Tarea> findByCategorias_Nombre(String nombreCategoria);

    // Contar el número de tareas en un estado específico para un usuario
    long countByUsuarioAsignadoIdAndEstado(Long idUsuario, String estado);
    
    // Buscar tareas que dependen de otra tarea específica
    // List<Tarea> findByTareasDependencia_IdTarea(Long idTareaDependiente);
    /* @Query("SELECT t FROM Tarea t JOIN t.tareasDependencia td WHERE td.idTarea = :idTareaDepende")
    List<Tarea> findTareasQueDependenDe(@Param("idTareaDepende") Long idTareaDepende);
    */
}