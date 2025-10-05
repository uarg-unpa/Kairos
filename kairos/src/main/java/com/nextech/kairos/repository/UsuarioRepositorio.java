package com.nextech.kairos.repository;

import com.nextech.kairos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// CRÍTICO: Debe ser Integer si id_usuario es INT en MySQL.
public interface UsuarioRepositorio extends JpaRepository<Usuario, Integer> { 
    
    Optional<Usuario> findByEmail(String email);
    
    // ... otros métodos
}