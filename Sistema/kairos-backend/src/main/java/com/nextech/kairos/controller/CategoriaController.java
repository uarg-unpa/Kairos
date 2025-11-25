package com.nextech.kairos.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

import com.nextech.kairos.dto.CategoriaRequest;
import com.nextech.kairos.dto.CategoriaResponse;
import com.nextech.kairos.mapper.CategoriaMapper;
import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.service.ICategoriaService;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:4200")
public class CategoriaController {

    private final ICategoriaService categoriaService;
    private final CategoriaMapper categoriaMapper;

    public CategoriaController(ICategoriaService categoriaService, CategoriaMapper categoriaMapper) {
        this.categoriaService = categoriaService;
        this.categoriaMapper = categoriaMapper;
    }

    @GetMapping
    public List<CategoriaResponse> getCategorias() {
        return categoriaService.listarCategorias()
                .stream()
                .map(categoriaMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponse> obtenerPorId(@PathVariable Long id) {
        return categoriaService.obtenerPorId(id)
                .map(categoriaMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> crearCategoria(@RequestBody CategoriaRequest categoriaRequest) {
        Categoria nueva = categoriaService.crearCategoria(categoriaMapper.toEntity(categoriaRequest));
        return ResponseEntity.ok(categoriaMapper.toResponse(nueva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> actualizarCategoria(@PathVariable Long id,
            @RequestBody CategoriaRequest categoriaRequest) {
        Categoria actualizada = categoriaService.actualizarCategoria(id, categoriaMapper.toEntity(categoriaRequest));
        return ResponseEntity.ok(categoriaMapper.toResponse(actualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar/nombre")
    public List<CategoriaResponse> buscarPorNombre(@RequestParam String nombre) {
        return categoriaService.buscarPorNombreContiene(nombre)
                .stream()
                .map(categoriaMapper::toResponse)
                .toList();
    }

    @GetMapping("/proyecto/{idProyecto}")
    public ResponseEntity<List<CategoriaResponse>> buscarPorProyecto(@PathVariable Long idProyecto) {
        List<CategoriaResponse> categorias = categoriaService.buscarPorProyecto(idProyecto)
                .stream()
                .map(categoriaMapper::toResponse)
                .toList();

        if (categorias.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList()); // ✅ Devuelve 200 OK con []
        }

        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/proyecto/{idProyecto}/contar")
    public long contarPorProyecto(@PathVariable Long idProyecto) {
        return categoriaService.contarPorProyecto(idProyecto);
    }

    @GetMapping("/proyecto/{idProyecto}/nombre/{nombre}")
    public List<CategoriaResponse> buscarPorProyectoYNombre(
            @PathVariable Long idProyecto,
            @PathVariable String nombre) {
        return categoriaService.buscarPorProyectoYNombre(idProyecto, nombre)
                .stream()
                .map(categoriaMapper::toResponse)
                .toList();
    }

    @GetMapping("/tarea/{idTarea}")
    public List<CategoriaResponse> buscarPorTarea(@PathVariable Long idTarea) {
        return categoriaService.buscarPorTarea(idTarea)
                .stream()
                .map(categoriaMapper::toResponse)
                .toList();
    }
}
