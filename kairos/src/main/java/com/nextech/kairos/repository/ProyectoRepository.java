package com.nextech.kairos.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Proyecto;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    
    Optional<Proyecto> findByNombre(String nombre);
    

    @Query(value = "SELECT p FROM Proyecto p WHERE p.estado = :estado" )
    List<Proyecto> findByEstado(String estado);
    
    @Query(value = "SELECT p FROM Proyecto p WHERE p.fechaCreacion > :fecha" )
    List<Proyecto> findByFechaCreacionAfter(LocalDate fecha);
    
    @Query(value = "SELECT p FROM Proyecto p WHERE LOWER(p.equipo) LIKE LOWER(CONCAT('%', :equipo, '%'))" )
    List<Proyecto> findByEquipoContainingIgnoreCase(String equipo);
    
    @Query(value = "SELECT p FROM Proyecto p JOIN p.usuariosProyecto up WHERE up.usuario.id = :idUsuario" )
    List<Proyecto> findByUsuariosProyecto_Usuario_Id(Long idUsuario);

    @Query(value = "SELECT p FROM Proyecto p WHERE p.estado = :estado ORDER BY p.fechaCreacion DESC" )
    List<Proyecto> findByEstadoOrderByFechaCreacionDesc(String estado);
}
