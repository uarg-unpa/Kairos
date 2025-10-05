package com.nextech.kairos.repository;

import com.nextech.kairos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    /**
     * Find user by email (equivalent to PHP's findByEmail)
     */
    Optional<Usuario> findByEmail(String email);
    
    /**
     * Check if user exists by email
     */
    boolean existsByEmail(String email);
    
    /**
     * Find users by name containing (case insensitive search)
     */
    List<Usuario> findByNombreContainingIgnoreCase(String nombre);
    
    /**
     * Find users with specific role (equivalent to PHP's getUsersByRole)
     */
    @Query("SELECT DISTINCT u FROM Usuario u JOIN u.roles r WHERE r.nombre = :roleName")
    List<Usuario> findByRoleName(@Param("roleName") String roleName);
    
    /**
     * Find users with specific permission (through roles)
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
           "JOIN u.roles r " +
           "JOIN r.permisos p " +
           "WHERE p.nombre = :permisoName")
    List<Usuario> findByPermisoName(@Param("permisoName") String permisoName);
    
    /**
     * Get all users with their roles (fetch join to avoid N+1 problem)
     */
    @Query("SELECT DISTINCT u FROM Usuario u LEFT JOIN FETCH u.roles")
    List<Usuario> findAllWithRoles();
    
    /**
     * Find user by ID with roles and permissions loaded
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH r.permisos " +
           "WHERE u.id = :id")
    Optional<Usuario> findByIdWithRolesAndPermisos(@Param("id") Long id);
    
    /**
     * Count users by role
     */
    @Query("SELECT COUNT(DISTINCT u) FROM Usuario u JOIN u.roles r WHERE r.nombre = :roleName")
    long countByRoleName(@Param("roleName") String roleName);
}
