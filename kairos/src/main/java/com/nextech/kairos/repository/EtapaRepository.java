package com.nextech.kairos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Etapa;

@Repository
public interface EtapaRepository extends JpaRepository<Etapa, Long> {
    @Override
    @EntityGraph(attributePaths = {"iteraciones"})
    List<Etapa> findAll();

    @EntityGraph(attributePaths = {"iteraciones"})
    List<Etapa> findByProyecto_IdProyecto(Long idProyecto);
}
