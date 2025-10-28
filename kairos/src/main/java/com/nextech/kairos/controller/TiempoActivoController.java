package com.nextech.kairos.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.TiempoActivoResponse;
import com.nextech.kairos.dto.TiempoActivoStartRequest;
import com.nextech.kairos.dto.TiempoDetenerRequest;
import com.nextech.kairos.model.Tiempo;
import com.nextech.kairos.model.TiempoActivo;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.TiempoActivoService;
import com.nextech.kairos.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tiempos/activo")
public class TiempoActivoController {

    private final TiempoActivoService tiempoActivoService;
    private final UsuarioService usuarioService;

    public TiempoActivoController(TiempoActivoService tiempoActivoService, UsuarioService usuarioService) {
        this.tiempoActivoService = tiempoActivoService;
        this.usuarioService = usuarioService;
    }

    /**
     * Devuelve el cronómetro activo del usuario autenticado.
     * 204 No Content si no hay cronómetro activo.
     */
    @GetMapping
    public ResponseEntity<?> obtenerActivo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal();

        Optional<Usuario> usuarioOpt = usuarioService.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
        }

        Optional<TiempoActivo> activo = tiempoActivoService.getActiveForUser(usuarioOpt.get().getId());
        if (activo.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        TiempoActivo ta = activo.get();
        return ResponseEntity.ok(new TiempoActivoResponse(
            ta.getIdTiempoActivo(),
            ta.getUsuario().getId(),
            ta.getTarea().getIdTarea(),
            ta.getInicio()
        ));
    }

    /**
     * Inicia un cronómetro para la tarea indicada.
     * 201 Created con datos del cronómetro activo; 409 si ya existe uno.
     */
    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciar(@Valid @RequestBody TiempoActivoStartRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal();

        Usuario usuario = usuarioService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        try {
            TiempoActivo ta = tiempoActivoService.start(usuario.getId(), request.getIdTarea(), usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(new TiempoActivoResponse(
                ta.getIdTiempoActivo(),
                ta.getUsuario().getId(),
                ta.getTarea().getIdTarea(),
                ta.getInicio()
            ));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    /**
     * Detiene el cronómetro activo del usuario.
     * Acepta opcionalmente la duración efectiva (segundos) desde el frontend.
     */
    @PostMapping("/detener")
    public ResponseEntity<?> detener(@RequestBody(required = false) TiempoDetenerRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal();

        Usuario usuario = usuarioService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        try {
            Integer segundos = request != null ? request.getDuracionSegundos() : null;
            Tiempo tiempo = tiempoActivoService.stop(usuario.getId(), segundos);
            return ResponseEntity.ok(tiempo);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }
}
