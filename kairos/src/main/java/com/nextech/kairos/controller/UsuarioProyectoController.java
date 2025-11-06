package com.nextech.kairos.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.model.UsuarioProyectoId;
import com.nextech.kairos.service.IUsuarioProyectoService;

@RestController
@RequestMapping("/api/usuario-proyecto")
public class UsuarioProyectoController {

    @Autowired
    private IUsuarioProyectoService service;

    @GetMapping
    public List<UsuarioProyecto> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<UsuarioProyecto> listarPorUsuario(@PathVariable Long idUsuario) {
        return service.listarPorUsuario(idUsuario);
    }

    @GetMapping("/proyecto/{idProyecto}")
    public List<UsuarioProyecto> listarPorProyecto(@PathVariable Long idProyecto) {
        return service.listarPorProyecto(idProyecto);
    }

    @GetMapping("/relacion")
    public ResponseEntity<UsuarioProyecto> obtenerRelacion(
            @RequestParam Long idUsuario,
            @RequestParam Long idProyecto) {
        UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
        Optional<UsuarioProyecto> relacion = service.obtenerPorId(id);
        return relacion.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UsuarioProyecto asignarUsuarioProyecto(@RequestBody UsuarioProyecto usuarioProyecto) {
        return service.save(usuarioProyecto);
    }

    @DeleteMapping
    public ResponseEntity<Void> eliminarRelacion(
            @RequestParam Long idUsuario,
            @RequestParam Long idProyecto) {
        UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
