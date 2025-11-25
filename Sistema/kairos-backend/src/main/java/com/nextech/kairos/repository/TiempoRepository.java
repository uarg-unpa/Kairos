package com.nextech.kairos.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // metodo nuevo
    @Query("""
    SELECT t FROM Tiempo t
    WHERE t.usuario.id = :idUsuario
    ORDER BY t.fechaRegistro DESC, t.idTiempo DESC
""")
List<Tiempo> findLast5ByUsuarioId(@Param("idUsuario") Long idUsuario, Pageable pageable);


    @Query("SELECT t.tarea.idTarea, SUM(t.duracion) FROM Tiempo t WHERE t.usuario.id = :idUsuario GROUP BY t.tarea.idTarea")
    List<Object[]> sumHorasPorTareaUsuario(@Param("idUsuario") Long idUsuario);

    // Horas por iteración (t.duracion está en minutos)
    @Query("SELECT i.idIteracion, i.numero, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta JOIN ta.iteracion i " +
           "GROUP BY i.idIteracion, i.numero ORDER BY i.numero")
    List<Object[]> sumHorasPorIteracionGlobal();

    @Query("SELECT i.idIteracion, i.numero, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE i.etapa.idEtapa = :etapaId " +
           "GROUP BY i.idIteracion, i.numero ORDER BY i.numero")
    List<Object[]> sumHorasPorIteracionEnEtapa(@Param("etapaId") Long etapaId);

    @Query("SELECT i.idIteracion, i.numero, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE i.etapa.proyecto.idProyecto = :proyectoId " +
           "GROUP BY i.idIteracion, i.numero ORDER BY i.numero")
    List<Object[]> sumHorasPorIteracionEnProyecto(@Param("proyectoId") Long proyectoId);

    // Con rango de fechas
    @Query("SELECT i.idIteracion, i.numero, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY i.idIteracion, i.numero ORDER BY i.numero")
    List<Object[]> sumHorasPorIteracionGlobalRango(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT i.idIteracion, i.numero, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE i.etapa.idEtapa = :etapaId AND t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY i.idIteracion, i.numero ORDER BY i.numero")
    List<Object[]> sumHorasPorIteracionEnEtapaRango(@Param("etapaId") Long etapaId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT i.idIteracion, i.numero, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE i.etapa.proyecto.idProyecto = :proyectoId AND t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY i.idIteracion, i.numero ORDER BY i.numero")
    List<Object[]> sumHorasPorIteracionEnProyectoRango(@Param("proyectoId") Long proyectoId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    // Horas por usuario (global o filtrado por iteración)
    @Query("SELECT u.id, u.nombre, COALESCE(SUM(t.duracion),0) FROM Tiempo t JOIN t.usuario u GROUP BY u.id, u.nombre ORDER BY u.nombre")
    List<Object[]> sumHorasPorUsuarioGlobal();

    @Query("SELECT u.id, u.nombre, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.usuario u JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE i.idIteracion = :iteracionId " +
           "GROUP BY u.id, u.nombre ORDER BY u.nombre")
    List<Object[]> sumHorasPorUsuarioEnIteracion(@Param("iteracionId") Long iteracionId);

    @Query("SELECT u.id, u.nombre, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.usuario u JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE i.etapa.proyecto.idProyecto = :proyectoId " +
           "GROUP BY u.id, u.nombre ORDER BY u.nombre")
    List<Object[]> sumHorasPorUsuarioEnProyecto(@Param("proyectoId") Long proyectoId);

    // Con rango de fechas
    @Query("SELECT u.id, u.nombre, COALESCE(SUM(t.duracion),0) FROM Tiempo t JOIN t.usuario u " +
           "WHERE t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY u.id, u.nombre ORDER BY u.nombre")
    List<Object[]> sumHorasPorUsuarioGlobalRango(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT u.id, u.nombre, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.usuario u JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE i.idIteracion = :iteracionId AND t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY u.id, u.nombre ORDER BY u.nombre")
    List<Object[]> sumHorasPorUsuarioEnIteracionRango(@Param("iteracionId") Long iteracionId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT u.id, u.nombre, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.usuario u JOIN t.tarea ta JOIN ta.iteracion i " +
           "WHERE i.etapa.proyecto.idProyecto = :proyectoId AND t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY u.id, u.nombre ORDER BY u.nombre")
    List<Object[]> sumHorasPorUsuarioEnProyectoRango(@Param("proyectoId") Long proyectoId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    // Horas por categoría (para reportes semanales)
    @Query("SELECT c.idCategoria, COALESCE(c.nombre, 'Sin categoría'), COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta LEFT JOIN ta.categorias c " +
           "GROUP BY c.idCategoria, c.nombre ORDER BY COALESCE(c.nombre, 'Sin categoría')")
    List<Object[]> sumHorasPorCategoriaGlobal();

    @Query("SELECT c.idCategoria, COALESCE(c.nombre, 'Sin categoría'), COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta LEFT JOIN ta.categorias c JOIN ta.iteracion i " +
           "WHERE i.idIteracion = :iteracionId " +
           "GROUP BY c.idCategoria, c.nombre ORDER BY COALESCE(c.nombre, 'Sin categoría')")
    List<Object[]> sumHorasPorCategoriaEnIteracion(@Param("iteracionId") Long iteracionId);

    @Query("SELECT c.idCategoria, COALESCE(c.nombre, 'Sin categoría'), COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta LEFT JOIN ta.categorias c JOIN ta.iteracion i " +
           "WHERE i.etapa.proyecto.idProyecto = :proyectoId " +
           "GROUP BY c.idCategoria, c.nombre ORDER BY COALESCE(c.nombre, 'Sin categoría')")
    List<Object[]> sumHorasPorCategoriaEnProyecto(@Param("proyectoId") Long proyectoId);

    @Query("SELECT c.idCategoria, COALESCE(c.nombre, 'Sin categoría'), COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta LEFT JOIN ta.categorias c " +
           "WHERE t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY c.idCategoria, c.nombre ORDER BY COALESCE(c.nombre, 'Sin categoría')")
    List<Object[]> sumHorasPorCategoriaGlobalRango(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT c.idCategoria, COALESCE(c.nombre, 'Sin categoría'), COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta LEFT JOIN ta.categorias c JOIN ta.iteracion i " +
           "WHERE i.idIteracion = :iteracionId AND t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY c.idCategoria, c.nombre ORDER BY COALESCE(c.nombre, 'Sin categoría')")
    List<Object[]> sumHorasPorCategoriaEnIteracionRango(@Param("iteracionId") Long iteracionId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT c.idCategoria, COALESCE(c.nombre, 'Sin categoría'), COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta LEFT JOIN ta.categorias c JOIN ta.iteracion i " +
           "WHERE i.etapa.proyecto.idProyecto = :proyectoId AND t.fechaRegistro BETWEEN :desde AND :hasta " +
           "GROUP BY c.idCategoria, c.nombre ORDER BY COALESCE(c.nombre, 'Sin categoría')")
    List<Object[]> sumHorasPorCategoriaEnProyectoRango(@Param("proyectoId") Long proyectoId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
    @Query("SELECT e.idEtapa, e.nombre, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta JOIN ta.iteracion i JOIN i.etapa e " +
           "WHERE (:proyectoId IS NULL OR e.proyecto.idProyecto = :proyectoId) " +
           "AND (:etapaId IS NULL OR e.idEtapa = :etapaId) " +
           "AND (:iteracionId IS NULL OR i.idIteracion = :iteracionId) " +
           "AND (:desde IS NULL OR t.fechaRegistro >= :desde) " +
           "AND (:hasta IS NULL OR t.fechaRegistro <= :hasta) " +
           "GROUP BY e.idEtapa, e.nombre ORDER BY e.nombre")
    List<Object[]> sumHorasPorEtapa(@Param("proyectoId") Long proyectoId,
                                    @Param("etapaId") Long etapaId,
                                    @Param("iteracionId") Long iteracionId,
                                    @Param("desde") LocalDate desde,
                                    @Param("hasta") LocalDate hasta);

    @Query("SELECT t.fechaRegistro, ta.idTarea, ta.nombre, COALESCE(SUM(t.duracion),0) FROM Tiempo t " +
           "JOIN t.tarea ta JOIN ta.iteracion i JOIN i.etapa e " +
           "WHERE (:proyectoId IS NULL OR e.proyecto.idProyecto = :proyectoId) " +
           "AND (:etapaId IS NULL OR e.idEtapa = :etapaId) " +
           "AND (:iteracionId IS NULL OR i.idIteracion = :iteracionId) " +
           "AND (:desde IS NULL OR t.fechaRegistro >= :desde) " +
           "AND (:hasta IS NULL OR t.fechaRegistro <= :hasta) " +
           "GROUP BY t.fechaRegistro, ta.idTarea, ta.nombre " +
           "ORDER BY t.fechaRegistro")
    List<Object[]> sumHorasPorDiaYTarea(@Param("proyectoId") Long proyectoId,
                                        @Param("etapaId") Long etapaId,
                                        @Param("iteracionId") Long iteracionId,
                                        @Param("desde") LocalDate desde,
                                        @Param("hasta") LocalDate hasta);
}

