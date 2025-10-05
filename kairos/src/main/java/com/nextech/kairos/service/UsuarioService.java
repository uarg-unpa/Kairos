package com.nextech.kairos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nextech.kairos.repository.UsuarioRepositorio;
import com.nextech.kairos.exception.ResourceNotFoundException;
import com.nextech.kairos.model.Usuario;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    public List<Usuario> getAllUsuarios() {
        return usuarioRepositorio.findAll();
    }

    public Usuario createUsuario(Usuario usuario) {
        return usuarioRepositorio.save(usuario);
    }

    public Usuario getUsuarioById(Integer id) {
        return usuarioRepositorio.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}

