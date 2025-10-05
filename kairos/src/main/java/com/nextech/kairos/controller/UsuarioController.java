package com.nextech.kairos.controller;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.UsuarioRepositorio;
import com.nextech.kairos.service.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> getUsuarios() {
        return usuarioService.getAllUsuarios();
    }

    @PostMapping
    public Usuario createUsuario(@RequestBody Usuario usuario) {
        return usuarioService.createUsuario(usuario);
    }

    @GetMapping("/{id}")
    public Usuario getUsuario(@PathVariable Integer id) {
        return usuarioService.getUsuarioById(id);
    }
}


