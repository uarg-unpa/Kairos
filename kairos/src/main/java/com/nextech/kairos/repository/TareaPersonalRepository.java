package com.nextech.kairos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import com.nextech.kairos.model.TareaPersonal;


@Repository
public interface TareaPersonalRepository extends JpaRepository<TareaPersonal, Long> {
    List<TareaPersonal> findByUsuario(com.nextech.kairos.model.Usuario usuario);
    
    List<TareaPersonal> findByUsuarioAndEstado(com.nextech.kairos.model.Usuario usuario, String estado);
    
    List<TareaPersonal> findByProyectoPropuestoIdAndEstado(Long proyectoPropuestoId, String estado);
}
