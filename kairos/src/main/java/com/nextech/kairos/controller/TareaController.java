package com.nextech.kairos.controller;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.CategoriaDTO;
import com.nextech.kairos.dto.TareaDTO;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.TareaService;
import com.nextech.kairos.service.UsuarioService; // Importar el DTO

/**
 * Controlador REST para la gestión de Tareas.
 */
@RestController
@RequestMapping("/api/tareas")
public class TareaController {

    private final TareaService tareaService;
    private final UsuarioService usuarioService;
    
    public TareaController(TareaService tareaService, UsuarioService usuarioService) {
        this.tareaService = tareaService;
        this.usuarioService = usuarioService;
    }

    /**
     * [CRÍTICO] Obtiene las tareas asignadas al usuario autenticado, mapeando a DTO
     * para evitar el error de serialización en bucle.
     */
    @GetMapping("/mis-tareas")
    public ResponseEntity<List<TareaDTO>> getMisTareasAsignadas() { 
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) authentication.getPrincipal(); 

        Usuario usuario = usuarioService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado en la base de datos."));
        
        Long idUsuario = usuario.getId(); 

        List<Tarea> tareas = tareaService.findTareasAsignadasAUsuario(idUsuario);
        
        // MAPEAMOS A DTO para enviar solo los datos planos al Frontend
        List<TareaDTO> responseDTO = tareas.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responseDTO);
    }
    
    // --- Método de Mapeo a DTO (PLANO) ---
    private TareaDTO convertToDTO(Tarea t) {
        TareaDTO dto = new TareaDTO();
        
        // Propiedades de la Tarea
        // Tarea.idTarea es Long, TareaDTO.idTarea es Integer (usamos intValue)
        dto.setIdTarea(t.getIdTarea().intValue()); 
        dto.setNombre(t.getNombre());
        dto.setDescripcion(t.getDescripcion());
        dto.setEstado(t.getEstado());
        dto.setPrioridad(t.getPrioridad());
        dto.setFechaCreacion(t.getFechaCreacion());
        dto.setFechaFin(t.getFechaFin());
        
        // Relaciones (Solo datos simples)
        dto.setUsuarioNombre(t.getUsuarioAsignado() != null ? t.getUsuarioAsignado().getNombre() : null);
        // Asumiendo que el campo iteracionNumero es el número de la iteración.
        dto.setIteracionNumero(t.getIteracion() != null && t.getIteracion().getNumero() != null ? t.getIteracion().getNumero() : 0);
        
        // Categorías (Mapeo de N:M)
        Set<CategoriaDTO> categoriasDTO = t.getCategorias().stream()
            .map(c -> new CategoriaDTO(c.getIdCategoria(), c.getNombre(), c.getDescripcion()))
            .collect(Collectors.toSet());
        dto.setCategorias(categoriasDTO);

        return dto;
    }
}