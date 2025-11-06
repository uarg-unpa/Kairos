package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.service.IIteracionService;
import com.nextech.kairos.dto.IteracionDTO;
import com.nextech.kairos.mapper.IteracionMapper;


@RestController
@RequestMapping("/api/iteraciones")
@CrossOrigin(origins = "http://localhost:4200")
public class IteracionController {

    @Autowired
    private IIteracionService iteracionService;

    @GetMapping
    public List<IteracionDTO> listarIteraciones() {
        return iteracionService.listarIteraciones()
        .stream()
        .map(IteracionMapper::toDTO)
        .toList();
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
