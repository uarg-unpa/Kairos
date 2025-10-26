package com.nextech.kairos.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Reporte;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {

    List<Reporte> findByProyectoIdProyecto(Long idProyecto);

    // @Query("SELECT r FROM Reporte r WHERE r.proyecto.idProyecto = :idProyecto")
    List<Reporte> findByFechaReporte(LocalDate fechaReporte);

    // @Query("SELECT r FROM Reporte r WHERE r.formato = :formato")
    List<Reporte> findByFormato(String formato);
    
    // @Query("SELECT r FROM Reporte r WHERE r.proyecto.idProyecto = :idProyecto ORDER BY r.fechaReporte DESC")
    List<Reporte> findByProyectoIdProyectoOrderByFechaReporteDesc(Long idProyecto);
}