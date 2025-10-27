package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nextech.kairos.dto.CategoriaDTO;
import com.nextech.kairos.mapper.CategoriaMapper;
import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.service.ICategoriaService;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:4200") // Ajustá el puerto de Angular si es distinto
public class CategoriaController {

    private final ICategoriaService categoriaService;

    public CategoriaController(ICategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public List<CategoriaDTO> getCategorias() {
        return categoriaService.listarCategorias()
                .stream()
                .map(CategoriaMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> obtenerPorId(@PathVariable Long id) {
        return categoriaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Categoria> crearCategoria(@RequestBody Categoria categoria) {
        Categoria nueva = categoriaService.guardarCategoria(categoria);
        return ResponseEntity.ok(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizarCategoria(@PathVariable Long id, @RequestBody Categoria categoria) {
        Categoria actualizada = categoriaService.actualizarCategoria(id, categoria);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar/nombre")
    public List<Categoria> buscarPorNombre(@RequestParam String nombre) {
        return categoriaService.buscarPorNombreContiene(nombre);
    }

    @GetMapping("/proyecto/{idProyecto}")
    public List<Categoria> buscarPorProyecto(@PathVariable Long idProyecto) {
        return categoriaService.buscarPorProyecto(idProyecto);
    }

    @GetMapping("/proyecto/{idProyecto}/contar")
    public long contarPorProyecto(@PathVariable Long idProyecto) {
        return categoriaService.contarPorProyecto(idProyecto);
    }

    @GetMapping("/proyecto/{idProyecto}/nombre/{nombre}")
    public List<Categoria> buscarPorProyectoYNombre(
            @PathVariable Long idProyecto,
            @PathVariable String nombre) {
        return categoriaService.buscarPorProyectoYNombre(idProyecto, nombre);
    }

    @GetMapping("/tarea/{idTarea}")
    public List<Categoria> buscarPorTarea(@PathVariable Long idTarea) {
        return categoriaService.buscarPorTarea(idTarea);
    }
}
