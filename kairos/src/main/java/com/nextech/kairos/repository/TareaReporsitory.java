
package com.nextech.kairos.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.nextech.kairos.model.Tarea;

import java.util.List;
import java.util.Optional;

@Repository
public interface TareaReporsitory extends JpaRepository<Tarea, Integer> {
    
    Optional<Tarea> findByNombre(String nombre);
    
    
    boolean existsByNombre(String nombre);
    
    
    List<Tarea> findByNombreContainingIgnoreCase(String nombre);
    
    
    @Query("SELECT DISTINCT t FROM Tarea t WHERE t.idUsuario = :usuarioId")
    List<Tarea> findByUsuarioId(@Param("usuarioId") Integer usuarioId);
    
    
    @Query("SELECT DISTINCT t FROM Tarea t WHERE t.estado = :estado")
    List<Tarea> findByEstado(@Param("estado") String estado);

    
}