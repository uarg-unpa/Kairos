package com.nextech.kairos.controller;

import com.nextech.kairos.model.Rol;
import com.nextech.kairos.repository.RolRepositorio;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
public class RolController {

    private final RolRepositorio repo;

    public RolController(RolRepositorio repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Rol> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Rol crear(@RequestBody Rol usuario) {
        return repo.save(usuario);
    }

    @GetMapping("/{id}")
    public Rol obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Rol actualizar(@PathVariable Integer id, @RequestBody Rol rol) {
        Rol existente = repo.findById(id).orElseThrow();
        existente.setNombre(rol.getNombre());
        return repo.save(existente);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}