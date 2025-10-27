package com.nextech.kairos.controller;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.nextech.kairos.dto.CategoriaDTO;
import com.nextech.kairos.dto.TareaDTO;
import com.nextech.kairos.dto.TareaRequestDTO;
import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.TareaService;
import com.nextech.kairos.service.UsuarioService;
import com.nextech.kairos.service.IteracionService;
import com.nextech.kairos.service.CategoriaService;
import java.util.*;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "http://localhost:4200")
public class TareaController {

    @Autowired
    private TareaService tareaService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private IteracionService iteracionService;
    @Autowired
    private CategoriaService categoriaService;

    @GetMapping
    public List<TareaDTO> getTareas() {
        List<Tarea> tareas = tareaService.listarTareas();

        // Mapear cada Tarea a TareaDTO
        return tareas.stream().map(t -> {
            TareaDTO dto = new TareaDTO();
            dto.setIdTarea(t.getIdTarea());
            dto.setNombre(t.getNombre());
            dto.setDescripcion(t.getDescripcion());
            dto.setEstado(t.getEstado());
            dto.setPrioridad(t.getPrioridad());
            dto.setFechaCreacion(t.getFechaCreacion());
            dto.setFechaFin(t.getFechaFin());
            dto.setHorasEstimadas(t.getHorasEstimadas());

            dto.setUsuarioNombre(t.getUsuario().getNombre());
            dto.setIteracionNombre(t.getIteracion().getNumero());

            Set<CategoriaDTO> categoriasDTO = t.getCategorias().stream()
                    .map(c -> new CategoriaDTO(c.getIdCategoria(), c.getNombre(), c.getDescripcion()))
                    .collect(Collectors.toSet());
            dto.setCategorias(categoriasDTO);

            return dto;
        }).toList();
    }

    @GetMapping("/{id}")
    public Tarea obtener(@PathVariable Long id) {
        return tareaService.obtenerPorId(id);
    }

    @PostMapping
    public TareaDTO guardar(@RequestBody TareaRequestDTO dto) {
        // 1️⃣ Crear la entidad Tarea
        Tarea tarea = new Tarea();
        tarea.setNombre(dto.getNombre());
        tarea.setDescripcion(dto.getDescripcion());
        tarea.setEstado(dto.getEstado());
        tarea.setPrioridad(dto.getPrioridad());
        tarea.setFechaCreacion(dto.getFechaCreacion());
        tarea.setFechaFin(dto.getFechaFin());
        tarea.setHorasEstimadas(dto.getHorasEstimadas());

        // 2️⃣ Asociar Usuario
        Usuario usuario = usuarioService.findById(dto.getUsuarioId()).orElse(null);
        if (usuario == null) {
            throw new RuntimeException("Usuario no encontrado con id: " + dto.getUsuarioId());
        }
        tarea.setUsuario(usuario);

        // 3️⃣ Asociar Iteración
        Iteracion iteracion = iteracionService.obtenerPorId(dto.getIteracionId());
        if (iteracion == null) {
            throw new RuntimeException("Iteración no encontrada con id: " + dto.getIteracionId());
        }
        tarea.setIteracion(iteracion);

        // 4️⃣ Asociar Categorías
        Set<Categoria> categorias = new HashSet<>();
        if (dto.getCategoriaIds() != null) {
            for (Long idCat : dto.getCategoriaIds()) {
                Categoria cat = categoriaService.obtenerPorId(idCat).orElse(null);
                if (cat != null) {
                    categorias.add(cat);
                }
            }
        }
        tarea.setCategorias(categorias);

        Tarea tareaGuardada = tareaService.guardarTarea(tarea);

        TareaDTO dtoResponse = new TareaDTO();
        dtoResponse.setIdTarea(tareaGuardada.getIdTarea());
        dtoResponse.setNombre(tareaGuardada.getNombre());
        dtoResponse.setDescripcion(tareaGuardada.getDescripcion());
        dtoResponse.setEstado(tareaGuardada.getEstado());
        dtoResponse.setPrioridad(tareaGuardada.getPrioridad());
        dtoResponse.setFechaCreacion(tareaGuardada.getFechaCreacion());
        dtoResponse.setFechaFin(tareaGuardada.getFechaFin());
        dtoResponse.setHorasEstimadas(tareaGuardada.getHorasEstimadas());
        dtoResponse.setUsuarioNombre(tareaGuardada.getUsuario().getNombre());
        dtoResponse.setIteracionNombre(tareaGuardada.getIteracion().getNumero());
        dtoResponse.setCategorias(
                tareaGuardada.getCategorias().stream()
                        .map(c -> new CategoriaDTO(c.getIdCategoria(), c.getNombre(), c.getDescripcion()))
                        .collect(Collectors.toSet()));

        return dtoResponse;
    }

    @PutMapping("/{id}")
public TareaDTO actualizarTarea(@PathVariable Long id, @RequestBody Map<String, Object> cambios) {
    Tarea tarea = tareaService.obtenerPorId(id);
    if (tarea == null) {
        throw new RuntimeException("Tarea no encontrada con id: " + id);
    }

    // Actualizamos solo los campos que envía Angular
    if (cambios.containsKey("estado")) {
        tarea.setEstado(cambios.get("estado").toString());
    }
    if (cambios.containsKey("prioridad")) {
        tarea.setPrioridad(cambios.get("prioridad").toString());
    }
    // Agrega más campos si quieres permitir actualizar

    Tarea tareaActualizada = tareaService.guardarTarea(tarea);

    // Mapeamos a DTO
    TareaDTO dtoResponse = new TareaDTO();
    dtoResponse.setIdTarea(tareaActualizada.getIdTarea());
    dtoResponse.setNombre(tareaActualizada.getNombre());
    dtoResponse.setDescripcion(tareaActualizada.getDescripcion());
    dtoResponse.setEstado(tareaActualizada.getEstado());
    dtoResponse.setPrioridad(tareaActualizada.getPrioridad());
    dtoResponse.setFechaCreacion(tareaActualizada.getFechaCreacion());
    dtoResponse.setFechaFin(tareaActualizada.getFechaFin());
    dtoResponse.setHorasEstimadas(tareaActualizada.getHorasEstimadas());
    dtoResponse.setUsuarioNombre(tareaActualizada.getUsuario().getNombre());
    dtoResponse.setIteracionNombre(tareaActualizada.getIteracion().getNumero());
    dtoResponse.setCategorias(
        tareaActualizada.getCategorias().stream()
            .map(c -> new CategoriaDTO(c.getIdCategoria(), c.getNombre(), c.getDescripcion()))
            .collect(Collectors.toSet())
    );

    return dtoResponse;
}

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        tareaService.eliminarTarea(id);
    }
}
