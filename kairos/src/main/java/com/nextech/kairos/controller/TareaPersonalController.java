package com.nextech.kairos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping
    public ResponseEntity<TareaPersonal> createPersonalTask(@AuthenticationPrincipal Usuario usuario, @RequestBody com.nextech.kairos.dto.TareaPersonalCreateDTO tareaPersonalDTO) {
        return ResponseEntity.ok(tareaPersonalService.createPersonalTask(usuario, tareaPersonalDTO.getNombre(), tareaPersonalDTO.getDescripcion()));
    }

    @GetMapping
    public ResponseEntity<List<TareaPersonal>> getPersonalTasks(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(tareaPersonalService.getPersonalTasksByUser(usuario));
    }

    @GetMapping("/project/{projectId}/proposed")
    public ResponseEntity<List<TareaPersonal>> getProposedTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(tareaPersonalService.getProposedTasksByProject(projectId));
    }

    @PutMapping("/{id}/propose")
    public ResponseEntity<TareaPersonal> proposeTask(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload) {
        Long proyectoId = payload.get("proyectoId");
        Long categoriaId = payload.get("categoriaId");
        return ResponseEntity.ok(tareaPersonalService.proposeTask(id, proyectoId, categoriaId));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Tarea> acceptTask(
            @PathVariable Long id,
            @RequestParam Long iteracionId,
            @RequestParam Long categoriaId) {
        Tarea nuevaTarea = tareaService.acceptPersonalTask(id, iteracionId, categoriaId);
        return ResponseEntity.ok(nuevaTarea);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectTask(@PathVariable Long id) {
        tareaPersonalService.rejectTask(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersonalTask(@PathVariable Long id) {
        tareaPersonalService.deletePersonalTask(id);
        return ResponseEntity.noContent().build();
    }
}
