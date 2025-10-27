package com.nextech.kairos.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Comentario; // Asegúrate de que el paquete sea el correcto

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    
    List<Comentario> findByTareaIdTarea(Long idTarea);

    @Query("SELECT c FROM Comentario c WHERE c.usuario.idUsuario = :idUsuario")
    List<Comentario> findByUsuarioId(Long idUsuario);

    @Query("SELECT c FROM Comentario c WHERE c.tarea.idTarea = :idTarea AND c.usuario.idUsuario = :idUsuario")
    List<Comentario> findByTareaIdTareaAndUsuarioId(Long idTarea, Long idUsuario);

    @Query("SELECT c FROM Comentario c WHERE c.fechaComentario > :fecha")
    List<Comentario> findByFechaComentarioAfter(LocalDate fecha);
    
    @Query("SELECT c FROM Comentario c WHERE c.fechaComentario < :fecha")
    List<Comentario> findByFechaComentarioBefore(LocalDate fecha);

    @Query("SELECT c FROM Comentario c WHERE c.tarea.idTarea = :idTarea ORDER BY c.fechaComentario DESC")
    List<Comentario> findByTareaIdTareaOrderByFechaComentarioDesc(Long idTarea);

}