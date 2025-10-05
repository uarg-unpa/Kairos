package com.nextech.kairos.controller;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.UsuarioRepositorio;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepositorio repo;

    public UsuarioController(UsuarioRepositorio repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Usuario> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Usuario crear(@RequestBody Usuario usuario) {
        return repo.save(usuario);
    }

    @GetMapping("/{id}")
    public Usuario obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Usuario actualizar(@PathVariable Integer id, @RequestBody Usuario usuario) {
        Usuario existente = repo.findById(id).orElseThrow();
        existente.setNombre(usuario.getNombre());
        existente.setEmail(usuario.getEmail());
        existente.setRol(usuario.getRol());
        return repo.save(existente);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}

