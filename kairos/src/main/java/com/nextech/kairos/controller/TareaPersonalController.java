package com.nextech.kairos.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.TareaResponse;
import com.nextech.kairos.mapper.TareaMapper;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.TareaPersonal;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.TareaPersonalService;
import com.nextech.kairos.service.TareaService;

@RestController
@RequestMapping("/api/personal-tasks")
public class TareaPersonalController {

    @Autowired
    private TareaPersonalService tareaPersonalService;

    @Autowired
    private TareaService tareaService;
    @Autowired
    private TareaMapper tareaMapper;


    @Autowired
    private com.nextech.kairos.service.UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<TareaPersonal> createPersonalTask(@AuthenticationPrincipal String email, @RequestBody com.nextech.kairos.dto.TareaPersonalCreateDTO tareaPersonalDTO) {
        Usuario usuario = usuarioService.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return ResponseEntity.ok(tareaPersonalService.crearTareaPersonal(usuario, tareaPersonalDTO.getNombre(), tareaPersonalDTO.getDescripcion()));
    }

    @GetMapping
    public ResponseEntity<List<TareaPersonal>> getPersonalTasks(@AuthenticationPrincipal String email) {
        Usuario usuario = usuarioService.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return ResponseEntity.ok(tareaPersonalService.getTareasPersonalesPorUsuario(usuario));
    }

    @GetMapping("/project/{projectId}/proposed")
    public ResponseEntity<List<TareaPersonal>> getProposedTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(tareaPersonalService.getTareasPropuestasPorProyecto(projectId));
    }

    @PutMapping("/{id}/propose")
    public ResponseEntity<TareaPersonal> proposeTask(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload) {
        Long proyectoId = payload.get("proyectoId");
        Long categoriaId = payload.get("categoriaId");
        return ResponseEntity.ok(tareaPersonalService.proponerTarea(id, proyectoId, categoriaId));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<TareaResponse> acceptTask(
            @PathVariable Long id,
            @RequestParam Long iteracionId,
            @RequestParam Long categoriaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin){
        Tarea nuevaTarea = tareaService.aceptarTareaPersonal(id, iteracionId, categoriaId, fechaFin);
        return ResponseEntity.ok(tareaMapper.toResponse(nuevaTarea));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectTask(@PathVariable Long id) {
        tareaPersonalService.rechazarTarea(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersonalTask(@PathVariable Long id) {
        tareaPersonalService.eliminarTareaPersonal(id);
        return ResponseEntity.noContent().build();
    }
}
