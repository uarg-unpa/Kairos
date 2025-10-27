package com.nextech.kairos.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
