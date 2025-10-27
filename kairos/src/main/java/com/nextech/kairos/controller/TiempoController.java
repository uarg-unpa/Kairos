package com.nextech.kairos.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.TiempoRegistroRequest;
import com.nextech.kairos.model.Tiempo;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.TiempoService;
import com.nextech.kairos.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tiempos")
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
}
