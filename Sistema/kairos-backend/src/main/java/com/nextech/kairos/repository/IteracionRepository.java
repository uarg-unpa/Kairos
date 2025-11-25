package com.nextech.kairos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import com.nextech.kairos.model.Iteracion;

@Repository
public interface IteracionRepository extends JpaRepository<Iteracion, Long> {
    java.util.List<Iteracion> findByEtapa_IdEtapa(Long idEtapa);
    java.util.List<Iteracion> findByEtapa_Proyecto_IdProyecto(Long idProyecto);

   

     @Query("""
        SELECT i FROM Iteracion i 
        WHERE i.etapa.proyecto.id = :idProyecto 
        AND :hoy BETWEEN i.fechaInicio AND i.fechaFin
        ORDER BY i.fechaInicio DESC
        """)
    List<Iteracion> findIteracionesActualesPorProyecto(
            @Param("idProyecto") Long idProyecto,
            @Param("hoy") LocalDate hoy
    );


}
