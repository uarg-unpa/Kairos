package com.nextech.kairos.controller;

import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.repository.PermisoRepositorio;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permisos")
public class PermisoController {

    private final PermisoRepositorio repo;

    public PermisoController(PermisoRepositorio repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Permiso> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Permiso crear(@RequestBody Permiso usuario) {
        return repo.save(usuario);
    }

    @GetMapping("/{id}")
    public Permiso obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Permiso actualizar(@PathVariable Integer id, @RequestBody Permiso permiso) {
        Permiso existente = repo.findById(id).orElseThrow();
        existente.setNombre(permiso.getNombre());
        return repo.save(existente);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}