package com.nextech.kairos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Rol;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    
    Optional<Rol> findByNombre(String nombre);
    
    boolean existsByNombre(String nombre);
    
    List<Rol> findByNombreContainingIgnoreCase(String nombre);
    
    @Query("SELECT DISTINCT r FROM Rol r JOIN r.permisos p WHERE p.nombre = :permisoName")
    List<Rol> findByPermisoName(@Param("permisoName") String permisoName);
    
    @Query("SELECT DISTINCT r FROM Rol r LEFT JOIN FETCH r.permisos")
    List<Rol> findAllWithPermisos();
    
    @Query("SELECT DISTINCT r FROM Rol r " +
           "LEFT JOIN FETCH r.permisos " +
           "WHERE r.id = :id")
    Optional<Rol> findByIdWithPermisos(@Param("id") Long id);
    
    @Query("SELECT DISTINCT r FROM Rol r JOIN r.usuarios u WHERE u.id = :usuarioId")
    List<Rol> findByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT COUNT(DISTINCT r) FROM Rol r JOIN r.permisos p WHERE p.nombre = :permisoName")
    long countByPermisoName(@Param("permisoName") String permisoName);
}
