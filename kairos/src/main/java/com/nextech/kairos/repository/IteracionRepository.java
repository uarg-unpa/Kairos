package com.nextech.kairos.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Iteracion; // Asegúrate de que el paquete sea el correcto

@Repository
public interface IteracionRepository extends JpaRepository<Iteracion, Long> {

    List<Iteracion> findByEtapaIdEtapa(Long idEtapa);

    @Query("SELECT i FROM Iteracion i WHERE i.etapa.idEtapa = :idEtapa AND i.numero = :numero")
    Optional<Iteracion> findByEtapaIdEtapaAndNumero(Long idEtapa, Integer numero);

    @Query("SELECT i FROM Iteracion i WHERE i.fechaFin <= :fecha")
    // iteraciones que ya han terminado
    List<Iteracion> findByFechaFinLessThanEqual(LocalDate fecha);
    
    @Query("SELECT i FROM Iteracion i WHERE i.fechaInicio > :fecha")
    List<Iteracion> findByFechaInicioAfter(LocalDate fecha);

    @Query("SELECT COUNT(i) FROM Iteracion i WHERE i.etapa.idEtapa = :idEtapa")
    long countByEtapaIdEtapa(Long idEtapa);
}
