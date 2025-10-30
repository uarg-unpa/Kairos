package com.nextech.kairos.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.nextech.kairos.model.UsuarioProyecto; 
import com.nextech.kairos.model.UsuarioProyectoId;

@Repository
public interface UsuarioProyectoRepository extends JpaRepository<UsuarioProyecto, UsuarioProyectoId> {

    @Query("SELECT up FROM UsuarioProyecto up WHERE up.id.idProyecto = :idProyecto")
    List<UsuarioProyecto> findByIdProyectoIdProyecto(Long idProyecto);

    @Query("SELECT up FROM UsuarioProyecto up WHERE up.id.idUsuario = :idUsuario")
    List<UsuarioProyecto> findByIdUsuarioIdUsuario(Long idUsuario);

    @Query("SELECT up FROM UsuarioProyecto up WHERE up.rolProyecto = :rolProyecto")
    List<UsuarioProyecto> findByRolProyecto(String rolProyecto);

    @Query("SELECT up.rolProyecto FROM UsuarioProyecto up WHERE up.id.idUsuario = :idUsuario AND up.id.idProyecto = :idProyecto")
    String findRolProyectoByIds(Long idUsuario, Long idProyecto);
}