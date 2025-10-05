package com.nextech.kairos.repository;

import com.nextech.kairos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Integer> {}
