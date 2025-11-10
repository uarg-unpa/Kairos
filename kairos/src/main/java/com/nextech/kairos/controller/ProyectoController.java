package com.nextech.kairos.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.CrearProyectoRequest;
import com.nextech.kairos.dto.ProyectoDetalleResponse;
import com.nextech.kairos.dto.UsuarioProyectoResponse;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.service.ProyectoService;
import com.nextech.kairos.service.UsuarioProyectoService;
import com.nextech.kairos.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/proyectos")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ProyectoController {

    @Autowired
    private ProyectoService proyectoService;

    @Autowired
    private AuthService authService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private UsuarioProyectoService usuarioProyectoService;

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
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    public ResponseEntity<?> crearProyecto(
        @Valid @RequestBody CrearProyectoRequest request,
        Authentication auth) {

        if (proyectoService.existsByNombre(request.getNombre())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Ya existe un proyecto con el nombre: " + request.getNombre()));
        }

        try {
            Proyecto proyecto = new Proyecto();
            proyecto.setNombre(request.getNombre());
            proyecto.setEquipo(request.getEquipo());
            proyecto.setDescripcion(request.getDescripcion());
            proyecto.setFechaInicio(
                request.getFechaInicio() != null && !request.getFechaInicio().isBlank()
                    ? LocalDate.parse(request.getFechaInicio())
                    : null
            );
            proyecto.setEstado("En Progreso");
            proyecto.setLogo(request.getLogo());

            // ✅ guarda el proyecto primero
            Proyecto guardado = proyectoService.save(proyecto);

            // ✅ asegurate de recargarlo para que esté en contexto persistente
            guardado = proyectoService.findById(guardado.getIdProyecto())
                    .orElseThrow(() -> new RuntimeException("Error al recargar el proyecto guardado"));

            // ✅ ahora asigna el líder
            Usuario lider = usuarioService.findById(request.getLiderId())
                    .orElseThrow(() -> new RuntimeException("Líder no encontrado"));

            UsuarioProyecto up = new UsuarioProyecto(lider, guardado, "Líder");
            usuarioProyectoService.save(up);

            return ResponseEntity.ok(guardado);

        } catch (Exception e) {
            e.printStackTrace(); // 👈 te mostrará el stacktrace real en consola
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProyectoById(
            @PathVariable Long id,
            Authentication auth) {

        try {
            Usuario usuario = getCurrentUser(auth);

            // Cargar proyecto con usuarios
            Proyecto proyecto = proyectoService.findByIdWithUsuarios(id)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado"));

            // Validar acceso
            boolean esAdmin = authService.isAdmin(usuario.getEmail());
            boolean tieneAcceso = proyecto.getUsuariosProyecto().stream()
                .anyMatch(up -> up.getUsuario().getId().equals(usuario.getId()));

            if (!esAdmin && !tieneAcceso) {
                return ResponseEntity.status(403)
                    .body(Map.of("error", "Acceso denegado"));
            }

            // Crear DTO
            List<UsuarioProyectoResponse> usuarios = proyecto.getUsuariosProyecto().stream()
                .map(UsuarioProyectoResponse::new)
                .toList();

            ProyectoDetalleResponse response = new ProyectoDetalleResponse(proyecto, usuarios);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }


}