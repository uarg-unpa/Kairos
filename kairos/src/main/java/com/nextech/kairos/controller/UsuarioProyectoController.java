package com.nextech.kairos.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.UsuarioProyectoResponse;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.model.UsuarioProyectoId;
import com.nextech.kairos.service.IUsuarioProyectoService;
import com.nextech.kairos.service.ProyectoService;
import com.nextech.kairos.service.UsuarioService;

@RestController
@RequestMapping("/api/usuario-proyecto")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class UsuarioProyectoController {

    @Autowired
    private IUsuarioProyectoService usuarioProyectoService;

    @Autowired
    private ProyectoService proyectoService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioProyecto> listarTodos() {
        return usuarioProyectoService.listarTodos();
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<UsuarioProyecto> listarPorUsuario(@PathVariable Long idUsuario) {
        return usuarioProyectoService.listarPorUsuario(idUsuario);
    }

    @GetMapping("/proyecto/{idProyecto}/miembros")
    public ResponseEntity<List<UsuarioProyectoResponse>> getMiembros(@PathVariable Long idProyecto) {
        List<UsuarioProyecto> relaciones = usuarioProyectoService.listarPorProyecto(idProyecto);
        
        List<UsuarioProyectoResponse> response = relaciones.stream()
            .map(UsuarioProyectoResponse::new)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/relacion")
    public ResponseEntity<UsuarioProyecto> obtenerRelacion(
            @RequestParam Long idUsuario,
            @RequestParam Long idProyecto) {
        UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
        Optional<UsuarioProyecto> relacion = usuarioProyectoService.obtenerPorId(id);
        return relacion.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/agregar")
    public ResponseEntity<?> agregarMiembro(
            @RequestParam Long idProyecto,
            @RequestParam Long idUsuario,
            @RequestParam String rolProyecto) {

        try {
            Proyecto proyecto = proyectoService.findById(idProyecto)
                    .orElseThrow(() -> new RuntimeException("Proyecto no encontrado"));

            Usuario usuario = usuarioService.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
            if (usuarioProyectoService.obtenerPorId(id).isPresent()) {
                return ResponseEntity.badRequest()
                        .body("El usuario ya está en el proyecto");
            }

            UsuarioProyecto up = new UsuarioProyecto();
            up.setUsuario(usuario);
            up.setProyecto(proyecto);
            up.setRolProyecto(rolProyecto);

            UsuarioProyecto guardado = usuarioProyectoService.save(up);
            return ResponseEntity.ok(guardado);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Error al agregar miembro: " + e.getMessage());
        }
    }

    @PostMapping("/invitar")
    public ResponseEntity<?> invitarMiembro(
            @RequestParam Long idProyecto,
            @RequestParam String email,
            @RequestParam String rolProyecto) {

        try {
            // Se elimina toda la lógica de validación/creación/asignación de rol.
            // Se llama directamente al método del ProyectoService que hace todo (incluyendo la lógica del rol).
            UsuarioProyecto guardado = proyectoService.invitarUsuario(idProyecto, email, rolProyecto);
            return ResponseEntity.ok(guardado);

        } catch (RuntimeException e) { // Cambiado de Exception a RuntimeException para capturar las excepciones del Service
            return ResponseEntity.badRequest()
                    .body("Error al invitar: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al invitar: " + e.getMessage());
        }
    }

    // ========================================
    // 7. EDITAR ROL EN PROYECTO
    // ========================================
    @PutMapping("/editar-rol")
    public ResponseEntity<?> editarRol(
            @RequestParam Long idProyecto,
            @RequestParam Long idUsuario,
            @RequestParam String nuevoRol) {

        try {
            UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
            UsuarioProyecto up = usuarioProyectoService.obtenerPorId(id)
                    .orElseThrow(() -> new RuntimeException("Relación no encontrada"));

            up.setRolProyecto(nuevoRol);
            UsuarioProyecto actualizado = usuarioProyectoService.save(up);
            return ResponseEntity.ok(actualizado);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Error al editar rol: " + e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> eliminarRelacion(
            @RequestParam Long idUsuario,
            @RequestParam Long idProyecto) {
        UsuarioProyectoId id = new UsuarioProyectoId(idUsuario, idProyecto);
        usuarioProyectoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}