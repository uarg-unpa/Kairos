package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.nextech.kairos.dto.TiempoEditRequestDTO;
import com.nextech.kairos.dto.TiempoRegistroRequest;
import com.nextech.kairos.dto.TiempoResponseDTO;
import com.nextech.kairos.dto.HorasPorIteracionDTO;
import com.nextech.kairos.dto.HorasPorUsuarioDTO;
import com.nextech.kairos.model.Tiempo;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.TiempoService;
import com.nextech.kairos.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tiempos")
@CrossOrigin(origins = "http://localhost:4200")
public class TiempoController {

    private final TiempoService tiempoService;
    private final UsuarioService usuarioService;

    public TiempoController(TiempoService tiempoService, UsuarioService usuarioService) {
        this.tiempoService = tiempoService;
        this.usuarioService = usuarioService;
    }

    /**
     * Registra un nuevo tiempo, obtenido del cronómetro o manual.
     * Obtiene el usuario autenticado del contexto de seguridad.
     */
    @PostMapping
    public ResponseEntity<Tiempo> registrarTiempo(@Valid @RequestBody TiempoRegistroRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal();

        Usuario usuario = usuarioService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado, no se puede registrar tiempo."));
        
        Tiempo nuevoTiempo = new Tiempo();
        
        Tiempo tiempoGuardado = tiempoService.registerTime(
            nuevoTiempo, 
            request.getIdTarea(), 
            usuario.getId(), 
            request.getDuracionSegundos(), 
            request.getFechaRegistro(),
            request.getDescripcion()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(tiempoGuardado);
    }
    @GetMapping("/ultimos")
    public ResponseEntity<List<TiempoResponseDTO>> getUltimosTiempos(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        Usuario usuario = usuarioService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<TiempoResponseDTO> ultimos = tiempoService.findLast5ByUsuarioId(usuario.getId());
        return ResponseEntity.ok(ultimos);
    }

    @PutMapping("/{idTiempo}")
    public ResponseEntity<Tiempo> editarTiempo(
            @PathVariable Long idTiempo,
            @Valid @RequestBody TiempoEditRequestDTO request,
            Authentication authentication) {

        String email = (String) authentication.getPrincipal();
        Usuario usuario = usuarioService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Tiempo tiempoActualizado = tiempoService.updateTime(idTiempo, request, usuario.getId());
        return ResponseEntity.ok(tiempoActualizado);
    }

    // Reportes simples para dashboard
    @GetMapping("/horas-por-iteracion")
    public ResponseEntity<List<HorasPorIteracionDTO>> horasPorIteracion(
        @RequestParam(name = "etapaId", required = false) Long etapaId,
        @RequestParam(name = "proyectoId", required = false) Long proyectoId,
        @RequestParam(name = "from", required = false) String from,
        @RequestParam(name = "to", required = false) String to
    ) {
        java.util.List<Object[]> rows;
        if (from != null && to != null) {
            java.time.LocalDate f = java.time.LocalDate.parse(from);
            java.time.LocalDate t = java.time.LocalDate.parse(to);
            if (etapaId != null) {
                rows = tiempoService.horasPorIteracionEnEtapaRango(etapaId, f, t);
            } else if (proyectoId != null) {
                rows = tiempoService.horasPorIteracionEnProyectoRango(proyectoId, f, t);
            } else {
                rows = tiempoService.horasPorIteracionGlobalRango(f, t);
            }
        } else {
            if (etapaId != null) {
                rows = tiempoService.horasPorIteracionEnEtapa(etapaId);
            } else if (proyectoId != null) {
                rows = tiempoService.horasPorIteracionEnProyecto(proyectoId);
            } else {
                rows = tiempoService.horasPorIteracionGlobal();
            }
        }
        List<HorasPorIteracionDTO> out = rows.stream()
            .map(r -> new HorasPorIteracionDTO(((Number) r[0]).longValue(), (Integer) r[1], ((Number) r[2]).intValue()))
            .toList();
        return ResponseEntity.ok(out);
    }

    @GetMapping("/horas-por-usuario")
    public ResponseEntity<List<HorasPorUsuarioDTO>> horasPorUsuario(
        @RequestParam(name = "iteracionId", required = false) Long iteracionId,
        @RequestParam(name = "proyectoId", required = false) Long proyectoId,
        @RequestParam(name = "from", required = false) String from,
        @RequestParam(name = "to", required = false) String to
    ) {
        java.util.List<Object[]> rows;
        if (from != null && to != null) {
            java.time.LocalDate f = java.time.LocalDate.parse(from);
            java.time.LocalDate t = java.time.LocalDate.parse(to);
            if (iteracionId != null) {
                rows = tiempoService.horasPorUsuarioEnIteracionRango(iteracionId, f, t);
            } else if (proyectoId != null) {
                rows = tiempoService.horasPorUsuarioEnProyectoRango(proyectoId, f, t);
            } else {
                rows = tiempoService.horasPorUsuarioGlobalRango(f, t);
            }
        } else {
            if (iteracionId != null) {
                rows = tiempoService.horasPorUsuarioEnIteracion(iteracionId);
            } else if (proyectoId != null) {
                rows = tiempoService.horasPorUsuarioEnProyecto(proyectoId);
            } else {
                rows = tiempoService.horasPorUsuarioGlobal();
            }
        }
        List<HorasPorUsuarioDTO> out = rows.stream()
            .map(r -> new HorasPorUsuarioDTO(((Number) r[0]).longValue(), (String) r[1], ((Number) r[2]).intValue()))
            .toList();
        return ResponseEntity.ok(out);
    }
}
