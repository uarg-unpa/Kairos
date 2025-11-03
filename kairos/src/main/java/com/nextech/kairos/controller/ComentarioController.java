package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nextech.kairos.model.Comentario;
import com.nextech.kairos.service.IComentarioService;

import jakarta.validation.Valid;

import com.nextech.kairos.dto.ComentarioRequest;
import com.nextech.kairos.dto.ComentarioResponse;
import com.nextech.kairos.mapper.ComentarioMapper;

@RestController
@RequestMapping("/api/comentarios")
public class ComentarioController {

    private final IComentarioService comentarioService;

    @Autowired
    public ComentarioController(IComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

   @GetMapping
public ResponseEntity<List<ComentarioRequest>> getAll() {
    List<ComentarioRequest> dtos = comentarioService.findAll()
            .stream()
            .map(ComentarioMapper::toDTO)
            .toList();
    return ResponseEntity.ok(dtos);
}

@GetMapping("/{id}")
public ResponseEntity<ComentarioRequest> getById(@PathVariable Long id) {
    return comentarioService.findById(id)
            .map(ComentarioMapper::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@GetMapping("/tarea/{idTarea}")
public ResponseEntity<List<ComentarioRequest>> getByTarea(@PathVariable Long idTarea) {
    List<ComentarioRequest> dtos = comentarioService.findComentariosByTarea(idTarea)
            .stream()
            .map(ComentarioMapper::toDTO)
            .toList();
    return ResponseEntity.ok(dtos);
}

@GetMapping("/tarea/{idTarea}/ordered")
public ResponseEntity<List<ComentarioRequest>> getByTareaOrdered(@PathVariable Long idTarea) {
    List<ComentarioRequest> dtos = comentarioService.findComentariosByTareaOrderedByDate(idTarea)
            .stream()
            .map(ComentarioMapper::toDTO)
            .toList();
    return ResponseEntity.ok(dtos);
}

@GetMapping("/usuario/{idUsuario}")
public ResponseEntity<List<ComentarioRequest>> getByUsuario(@PathVariable Long idUsuario) {
    List<ComentarioRequest> dtos = comentarioService.findComentariosByUsuario(idUsuario)
            .stream()
            .map(ComentarioMapper::toDTO)
            .toList();
    return ResponseEntity.ok(dtos);
}


    @PostMapping
public ResponseEntity<ComentarioRequest> create(@RequestBody @Valid ComentarioResponse dto) {
    Comentario comentario = ComentarioMapper.createDTO(dto);
    Comentario saved = comentarioService.createComentario(comentario, dto.getIdTarea(), dto.getIdUsuario());
    ComentarioRequest response = ComentarioMapper.toDTO(saved);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        comentarioService.delete(id);
        return ResponseEntity.noContent().build();
    }

   
}