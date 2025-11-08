package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.service.IIteracionService;
import com.nextech.kairos.dto.IteracionResponse;
import com.nextech.kairos.dto.IteracionRequest;
import com.nextech.kairos.mapper.IteracionMapper;

@RestController
@RequestMapping("/api/iteraciones")
@CrossOrigin(origins = "http://localhost:4200")
public class IteracionController {

    @Autowired
    private IIteracionService iteracionService;

    @GetMapping
    public ResponseEntity<List<IteracionResponse>> listarIteraciones() {
        List<IteracionResponse> iteraciones = iteracionService.listarIteraciones()
            .stream()
            .map(IteracionMapper::toResponse)
            .toList();
        return ResponseEntity.ok(iteraciones);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IteracionResponse> obtener(@PathVariable Long id) {
        Iteracion iteracion = iteracionService.obtenerPorId(id);
        return ResponseEntity.ok(IteracionMapper.toResponse(iteracion));
    }

    @PostMapping
    public ResponseEntity<IteracionResponse> guardar(@RequestBody @Valid IteracionRequest request) {
        Iteracion iteracion = IteracionMapper.toEntity(request);
        Iteracion savedIteracion = iteracionService.guardarIteracion(iteracion);
        return ResponseEntity.ok(IteracionMapper.toResponse(savedIteracion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        iteracionService.eliminarIteracion(id);
        return ResponseEntity.noContent().build();
    }
}
