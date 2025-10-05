package com.nextech.kairos.repository;

import com.nextech.kairos.model.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Opcional, pero no hace daño

@Repository
public interface PermisoRepositorio extends JpaRepository<Permiso, Integer> {
    
    // Método que devuelve el objeto directamente.
    Permiso findByNombre(String nombre); 
    
}