package com.nextech.kairos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.nextech.kairos.model.Iteracion;

@Repository
public interface IteracionRepository extends JpaRepository<Iteracion, Long> {
    List<Iteracion> findByEtapa_IdEtapa(Long idEtapa);
}
