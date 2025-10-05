package com.nextech.kairos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nextech.kairos.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<Usuario> findByNombreContainingIgnoreCase(String nombre);
    
    @Query("SELECT DISTINCT u FROM Usuario u JOIN u.roles r WHERE r.nombre = :roleName")
    List<Usuario> findByRoleName(@Param("roleName") String roleName);
    
    @Query("SELECT DISTINCT u FROM Usuario u " +
           "JOIN u.roles r " +
           "JOIN r.permisos p " +
           "WHERE p.nombre = :permisoName")
    List<Usuario> findByPermisoName(@Param("permisoName") String permisoName);
    
    @Query("SELECT DISTINCT u FROM Usuario u LEFT JOIN FETCH u.roles")
    List<Usuario> findAllWithRoles();
    
    @Query("SELECT DISTINCT u FROM Usuario u " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH r.permisos " +
           "WHERE u.id = :id")
    Optional<Usuario> findByIdWithRolesAndPermisos(@Param("id") Long id);
    
    @Query("SELECT COUNT(DISTINCT u) FROM Usuario u JOIN u.roles r WHERE r.nombre = :roleName")
    long countByRoleName(@Param("roleName") String roleName);
}
