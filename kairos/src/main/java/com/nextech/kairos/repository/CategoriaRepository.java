package com.nextech.kairos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Categoria; // Asegúrate de que el paquete sea el correcto

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombre(String nombre);
    
    // @Query("SELECT c FROM Categoria c WHERE LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Categoria> findByNombreContainingIgnoreCase(String nombre);

    // @Query("SELECT c FROM Categoria c WHERE c.proyecto.idProyecto = :idProyecto")
    List<Categoria> findByProyectoIdProyecto(Long idProyecto);

    // @Query("SELECT c FROM Categoria c WHERE c.proyecto.idProyecto = :idProyecto AND LOWER(c.nombre) = LOWER(:nombre)")
    List<Categoria> findByProyectoIdProyectoAndNombre(Long idProyecto, String nombre);

    // @Query("SELECT c FROM Categoria c JOIN c.tareas t WHERE t.idTarea = :idTarea")
    List<Categoria> findByTareas_IdTarea(Long idTarea);

    // @Query("SELECT COUNT(c) FROM Categoria c WHERE c.proyecto.idProyecto = :idProyecto")
    long countByProyectoIdProyecto(Long idProyecto);
}