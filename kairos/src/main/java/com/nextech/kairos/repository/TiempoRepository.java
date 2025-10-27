package com.nextech.kairos.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Tiempo;

@Repository
public interface TiempoRepository extends JpaRepository<Tiempo, Long> {

    
    List<Tiempo> findByTareaIdTarea(Long idTarea);

    @Query("SELECT t FROM Tiempo t WHERE t.usuario.id = :idUsuario")
    List<Tiempo> findByUsuarioId(Long idUsuario);

    @Query("SELECT t FROM Tiempo t WHERE t.tarea.idTarea = :idTarea AND t.usuario.id = :idUsuario")
    List<Tiempo> findByTareaIdTareaAndUsuarioId(Long idTarea, Long idUsuario);

    @Query("SELECT t FROM Tiempo t WHERE t.fechaRegistro BETWEEN :fechaInicio AND :fechaFin")
    List<Tiempo> findByFechaRegistroBetween(LocalDate fechaInicio, LocalDate fechaFin);
    
    @Query("SELECT t FROM Tiempo t WHERE t.usuario IS NULL")
    List<Tiempo> findByUsuarioIsNull();
}