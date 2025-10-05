package com.nextech.kairos.repository;

import com.nextech.kairos.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// El segundo argumento, Long, debe ser el tipo de dato del ID de tu clase Rol (que asumimos es Long)
public interface RolRepositorio extends JpaRepository<Rol, Integer> {

    // Método necesario para tu AuthService
    Optional<Rol> findByNombre(String nombre); 
    
}