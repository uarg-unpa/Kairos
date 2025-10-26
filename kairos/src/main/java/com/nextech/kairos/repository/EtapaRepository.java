package com.nextech.kairos.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Etapa; // Asegúrate de que el paquete sea el correcto

@Repository
public interface EtapaRepository extends JpaRepository<Etapa, Long> {

    List<Etapa> findByProyectoIdProyecto(Long idProyecto);

    // @Query("SELECT e FROM Etapa e WHERE e.proyecto.idProyecto = :idProyecto AND LOWER(e.nombre) = LOWER(:nombre)")
    Optional<Etapa> findByProyectoIdProyectoAndNombre(Long idProyecto, String nombre);

    // @Query("SELECT e FROM Etapa e WHERE LOWER(e.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Etapa> findByNombreContainingIgnoreCase(String nombre);
    
    // @Query("SELECT e FROM Etapa e WHERE e.fechaFin IS NULL OR e.fechaFin > :fechaActual")
    List<Etapa> findByFechaFinIsNullOrFechaFinAfter(LocalDate fechaActual);
    
    // @Query("SELECT e FROM Etapa e WHERE e.fechaInicio <= :fecha")
    List<Etapa> findByFechaInicioLessThanEqual(LocalDate fecha);

    // @Query("SELECT COUNT(e) FROM Etapa e WHERE e.proyecto.idProyecto = :idProyecto")
    long countByProyectoIdProyecto(Long idProyecto);
}