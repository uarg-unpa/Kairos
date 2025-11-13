package com.nextech.kairos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import com.nextech.kairos.model.Etapa;

@Repository
public interface EtapaRepository extends JpaRepository<Etapa, Long> {
    @Override
    @EntityGraph(attributePaths = {"iteraciones"})
    List<Etapa> findAll();
    @EntityGraph(attributePaths = {"iteraciones"})
    List<Etapa> findByProyecto_IdProyecto(Long idProyecto);
    @Query("SELECT e FROM Etapa e WHERE e.proyecto.idProyecto = :idProyecto AND :hoy BETWEEN e.fechaInicio AND e.fechaFin")
Optional<Etapa> findEtapaActualPorProyecto(@Param("idProyecto") Long idProyecto, @Param("hoy") LocalDate hoy);


    java.util.Optional<Etapa> findByEstado(String estado);
}
