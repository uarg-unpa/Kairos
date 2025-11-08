package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.service.ProyectoService;

@RestController
@RequestMapping("/api/proyectos")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ProyectoController {

    @Autowired
    private ProyectoService proyectoService;

    @Autowired
    private AuthService authService;

    private Usuario getCurrentUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("No autenticado");
        }
        String email = (String) auth.getPrincipal();
        return authService.getUserForSession(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // 1. MIS PROYECTOS → Miembros y Líderes
    @GetMapping("/mis-proyectos")
    public ResponseEntity<List<Proyecto>> getMisProyectos(Authentication auth) {
        Usuario usuario = getCurrentUser(auth);

        // Si es admin → TODOS
        if (authService.isAdmin(usuario.getEmail())) {
            return ResponseEntity.ok(proyectoService.findAll());
        }

        // Si no es admin → solo sus proyectos
        List<Proyecto> proyectos = proyectoService.findProjectsByUser(usuario.getId());
        return ResponseEntity.ok(proyectos);
    }

    // 2. LIDERADOS → Solo líderes
    @GetMapping("/liderados")
    public ResponseEntity<List<Proyecto>> getProyectosLiderados(Authentication auth) {
        Usuario usuario = getCurrentUser(auth);

        // Si es admin → todos los proyectos (opcional)
        if (authService.isAdmin(usuario.getEmail())) {
            return ResponseEntity.ok(proyectoService.findAll());
        }

        List<Proyecto> todos = proyectoService.findProjectsByUser(usuario.getId());
        List<Proyecto> liderados = todos.stream()
            .filter(p -> p.getUsuariosProyecto().stream()
                .anyMatch(up -> up.getUsuario().getId().equals(usuario.getId())
                    && "Líder".equalsIgnoreCase(up.getRolProyecto())))
            .toList();
        return ResponseEntity.ok(liderados);
    }

    // 3. TODOS → Solo admin (redundante, pero explícito)
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<List<Proyecto>> getAllProyectos() {
        return ResponseEntity.ok(proyectoService.findAll());
    }
}