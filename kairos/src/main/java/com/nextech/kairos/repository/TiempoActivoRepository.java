package com.nextech.kairos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.TiempoActivo;

@Repository
public interface TiempoActivoRepository extends JpaRepository<TiempoActivo, Long> {

    @Query("SELECT ta FROM TiempoActivo ta WHERE ta.usuario.id = :idUsuario")
    Optional<TiempoActivo> findByUsuarioId(Long idUsuario);
}

