package com.nextech.kairos.repository;

import com.nextech.kairos.model.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Long> {
    
    Optional<Permiso> findByNombre(String nombre);
    
    
    boolean existsByNombre(String nombre);
    
    
    List<Permiso> findByNombreContainingIgnoreCase(String nombre);
    
    
    @Query("SELECT DISTINCT p FROM Permiso p JOIN p.roles r WHERE r.id = :rolId")
    List<Permiso> findByRolId(@Param("rolId") Long rolId);
    
    
    @Query("SELECT DISTINCT p FROM Permiso p JOIN p.roles r WHERE r.nombre = :rolName")
    List<Permiso> findByRolName(@Param("rolName") String rolName);
    
    
    @Query("SELECT DISTINCT p FROM Permiso p " +
           "JOIN p.roles r " +
           "JOIN r.usuarios u " +
           "WHERE u.id = :usuarioId")
    List<Permiso> findByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    
    @Query("SELECT DISTINCT p FROM Permiso p " +
           "JOIN p.roles r " +
           "JOIN r.usuarios u " +
           "WHERE u.email = :email")
    List<Permiso> findByUsuarioEmail(@Param("email") String email);
    
    
    @Query("SELECT DISTINCT p FROM Permiso p LEFT JOIN FETCH p.roles")
    List<Permiso> findAllWithRoles();
    
    
    @Query("SELECT COUNT(DISTINCT p) FROM Permiso p JOIN p.roles r WHERE r.nombre = :rolName")
    long countByRolName(@Param("rolName") String rolName);
}
