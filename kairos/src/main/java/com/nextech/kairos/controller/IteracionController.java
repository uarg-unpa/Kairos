package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.service.IIteracionService;

@RestController
@RequestMapping("/api/iteraciones")
@CrossOrigin(origins = "http://localhost:4200")
public class IteracionController {

    @Autowired
    private IIteracionService iteracionService;

    @GetMapping
    public List<Iteracion> listarIteraciones() {
        return iteracionService.listarIteraciones();
    }

    @GetMapping("/{id}")
    public Iteracion obtener(@PathVariable Long id) {
        return iteracionService.obtenerPorId(id);
    }

    @PostMapping
    public Iteracion guardar(@RequestBody Iteracion iteracion) {
        return iteracionService.guardarIteracion(iteracion);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        iteracionService.eliminarIteracion(id);
    }
}
