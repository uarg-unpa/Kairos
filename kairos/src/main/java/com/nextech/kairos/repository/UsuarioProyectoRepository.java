package com.nextech.kairos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.model.UsuarioProyectoId;

@Repository
public interface UsuarioProyectoRepository extends JpaRepository<UsuarioProyecto, UsuarioProyectoId> {

    // Buscar todas las relaciones de un usuario
    List<UsuarioProyecto> findByUsuario_Id(Long idUsuario);

    // Buscar todas las relaciones de un proyecto
    List<UsuarioProyecto> findByProyecto_IdProyecto(Long idProyecto);

    // Buscar una relación específica por usuario y proyecto
Optional<UsuarioProyecto> findByUsuario_IdAndProyecto_IdProyecto(Long idUsuario, Long idProyecto);


    // Buscar por rol dentro del proyecto (ignorando mayúsculas/minúsculas)
    List<UsuarioProyecto> findByRolProyectoIgnoreCase(String rolProyecto);
}
