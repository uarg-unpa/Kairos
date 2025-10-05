package com.nextech.kairos.repository;

import com.nextech.kairos.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    
    /**
     * Find role by name (equivalent to PHP's findByName)
     */
    Optional<Rol> findByNombre(String nombre);
    
    /**
     * Check if role exists by name
     */
    boolean existsByNombre(String nombre);
    
    /**
     * Find roles by name containing (case insensitive search)
     */
    List<Rol> findByNombreContainingIgnoreCase(String nombre);
    
    /**
     * Find roles with specific permission
     */
    @Query("SELECT DISTINCT r FROM Rol r JOIN r.permisos p WHERE p.nombre = :permisoName")
    List<Rol> findByPermisoName(@Param("permisoName") String permisoName);
    
    /**
     * Get all roles with their permissions (fetch join to avoid N+1 problem)
     */
    @Query("SELECT DISTINCT r FROM Rol r LEFT JOIN FETCH r.permisos")
    List<Rol> findAllWithPermisos();
    
    /**
     * Find role by ID with permissions loaded
     */
    @Query("SELECT DISTINCT r FROM Rol r " +
           "LEFT JOIN FETCH r.permisos " +
           "WHERE r.id = :id")
    Optional<Rol> findByIdWithPermisos(@Param("id") Long id);
    
    /**
     * Find roles assigned to a specific user
     */
    @Query("SELECT DISTINCT r FROM Rol r JOIN r.usuarios u WHERE u.id = :usuarioId")
    List<Rol> findByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    /**
     * Count roles with specific permission
     */
    @Query("SELECT COUNT(DISTINCT r) FROM Rol r JOIN r.permisos p WHERE p.nombre = :permisoName")
    long countByPermisoName(@Param("permisoName") String permisoName);
}
