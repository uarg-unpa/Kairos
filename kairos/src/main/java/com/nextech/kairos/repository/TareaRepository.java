package com.nextech.kairos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Tarea;


@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    List<Tarea> findByNombreContainingIgnoreCase(String nombre);
    List<Tarea> findByEstado(String estado);
    List<Tarea> findByPrioridad(String prioridad);
    List<Tarea> findByUsuario_Id(Long idUsuario);
    List<Tarea> findByIteracion_IdIteracion(Long idIteracion);
    List<Tarea> findByCategorias_Nombre(String nombreCategoria);
    long countByUsuario_IdAndEstado(Long idUsuario, String estado);

    // 🔹 Consultas nuevas por horas estimadas
    List<Tarea> findByHorasEstimadas(Double horas);
    List<Tarea> findByHorasEstimadasGreaterThan(Double horas);
    List<Tarea> findByHorasEstimadasLessThan(Double horas);

    // Por proyecto a través de iteración -> etapa -> proyecto
    List<Tarea> findByIteracion_Etapa_Proyecto_IdProyecto(Long idProyecto);

    @Query("SELECT t FROM Tarea t " +
       "WHERE t.iteracion.idIteracion = :idIteracion " +
       "AND t.iteracion.etapa.proyecto.idProyecto = :idProyecto")
List<Tarea> findByProyectoIdAndIteracionId(
        @Param("idProyecto") Long idProyecto,
        @Param("idIteracion") Long idIteracion);


}
