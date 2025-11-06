package com.nextech.kairos.controller;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.nextech.kairos.dto.CategoriaDTO;
import com.nextech.kairos.dto.TareaRequestDTO;
import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.TareaService;
import com.nextech.kairos.service.UsuarioService;
import com.nextech.kairos.service.IIteracionService;
import com.nextech.kairos.service.ICategoriaService;
import java.util.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "http://localhost:4200")
public class TareaController {

    @Autowired
    private TareaService tareaService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private IIteracionService iteracionService;
    @Autowired
    private ICategoriaService categoriaService;

    @GetMapping
    public List<TareaRequestDTO> getTareas() {
        List<Tarea> tareas = tareaService.listarTareas();

        // Mapear cada Tarea a TareaDTO - REALIZAR EN OTRO ARCHIVO CUDNO PUEDAN
        return tareas.stream().map(t -> {
            TareaRequestDTO dto = new TareaRequestDTO();
            dto.setIdTarea(t.getIdTarea());
            dto.setNombre(t.getNombre());
            dto.setDescripcion(t.getDescripcion());
            dto.setEstado(t.getEstado());
            dto.setPrioridad(t.getPrioridad());
            dto.setFechaCreacion(t.getFechaCreacion());
            dto.setFechaFin(t.getFechaFin());
            dto.setHorasEstimadas(t.getHorasEstimadas());
            dto.setUsuarioId(t.getUsuario().getId());
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
    public TareaRequestDTO guardar(@RequestBody TareaRequestDTO dto) {
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

        TareaRequestDTO dtoResponse = new TareaRequestDTO();
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
public TareaRequestDTO actualizarTarea(@PathVariable Long id, @RequestBody Map<String, Object> cambios) {
    Tarea tarea = tareaService.obtenerPorId(id);
    if (tarea == null) {
        throw new RuntimeException("Tarea no encontrada con id: " + id);
    }

    if (cambios.containsKey("nombre")) {
        tarea.setNombre(cambios.get("nombre").toString());
        
    }

    if (cambios.containsKey("descripcion")) {
        tarea.setDescripcion(cambios.get("descripcion").toString());
        
    }
    // Actualizamos solo los campos que envía Angular
    if (cambios.containsKey("estado")) {
        tarea.setEstado(cambios.get("estado").toString());
    }
    if (cambios.containsKey("prioridad")) {
        tarea.setPrioridad(cambios.get("prioridad").toString());
    }

    if (cambios.containsKey("horasEstimadas")) {
    Object valor = cambios.get("horasEstimadas");
    if (valor != null) {
        try {
            tarea.setHorasEstimadas(Double.valueOf(valor.toString()));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El valor de horasEstimadas no es numérico: " + valor);
        }
    }

}
    if (cambios.containsKey("usuarioId")) {
    Object valor2 = cambios.get("usuarioId");
    if (valor2 != null) {
        try {
            Long usuarioId = Long.valueOf(valor2.toString());

            // ✅ si tenés un servicio:
            Usuario usuario = usuarioService.findById(usuarioId).orElse(null);

            // o si usás el repositorio directamente:
            // Usuario usuario = usuarioRepository.findById(usuarioId)
            //     .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + usuarioId));

            tarea.setUsuario(usuario);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El ID de usuario no es válido: " + valor2);
        }
                }

    }

    if (cambios.containsKey("categoriaIds")) {
    Object valor3 = cambios.get("categoriaIds");
    if (valor3 != null && valor3 instanceof List) {
        List<?> listaIds = (List<?>) valor3;
        Set<Categoria> categorias = new HashSet<>();
        for (Object idObj : listaIds) {
            try {
                Long categoriaId = Long.valueOf(idObj.toString());
                Categoria categoria = categoriaService.obtenerPorId(categoriaId).orElse(null);
                if (categoria != null) {
                    categorias.add(categoria);
                }
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("El ID de categoría no es válido: " + idObj);
            }
        }
        tarea.setCategorias(categorias);
        
    }
}


if (cambios.containsKey("iteracionId")) {
    Object valor4 = cambios.get("iteracionId");
    if (valor4 != null) {
        try {
            Long iteracionId = Long.valueOf(valor4.toString());

            Iteracion iteracion = iteracionService.obtenerPorId(iteracionId);
            if (iteracion != null) {
                tarea.setIteracion(iteracion);
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El ID de iteración no es válido: " + valor4);
        }
                }
    
}
    // Agrega más campos si quieres permitir actualizar

    Tarea tareaActualizada = tareaService.guardarTarea(tarea);

    // Mapeamos a DTO
    TareaRequestDTO dtoResponse = new TareaRequestDTO();
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

    @GetMapping("/mis-tareas")
public List<TareaRequestDTO> getTareasAsignadas(Authentication authentication) {
    // 🔐 El objeto Authentication lo llena Spring a partir del JWT
    String username = authentication.getName(); // normalmente el email o nombre de usuario

    Usuario usuario = usuarioService.findByEmail(username)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

    List<Tarea> tareas = tareaService.obtenerTareasPorUsuarioId(usuario.getId());

    return tareas.stream().map(t -> {
        TareaRequestDTO dto = new TareaRequestDTO();
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
        dto.setCategorias(
            t.getCategorias().stream()
                .map(c -> new CategoriaDTO(c.getIdCategoria(), c.getNombre(), c.getDescripcion()))
                .collect(Collectors.toSet())
        );
        return dto;
    }).collect(Collectors.toList());
}


}
