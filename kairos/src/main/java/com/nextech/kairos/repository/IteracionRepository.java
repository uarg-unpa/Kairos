package com.nextech.kairos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.nextech.kairos.model.Iteracion;

@Repository
public interface IteracionRepository extends JpaRepository<Iteracion, Long> {
    // Puedes agregar consultas personalizadas si lo necesitas
}
