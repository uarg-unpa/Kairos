package com.nextech.kairos.controller;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.CategoriaResponse;
import com.nextech.kairos.dto.TareaRequest;
import com.nextech.kairos.dto.TareaResponse;
import com.nextech.kairos.mapper.TareaMapper;
import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.ICategoriaService;
import com.nextech.kairos.service.IIteracionService;
import com.nextech.kairos.service.TareaService;
import com.nextech.kairos.service.UsuarioService;

import jakarta.transaction.Transactional;

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
    @Autowired
    private TareaMapper tareaMapper;

    private static final Logger logger = LoggerFactory.getLogger(TareaController.class);

    @GetMapping
    public List<TareaResponse> getTareas() {
        List<Tarea> tareas = tareaService.listarTareas();

        // Mapear cada Tarea a TareaDTO - REALIZAR EN OTRO ARCHIVO CUDNO PUEDAN
        return tareas.stream().map(t -> {
            TareaResponse dto = new TareaResponse();
            dto.setIdTarea(t.getIdTarea());
            dto.setNombre(t.getNombre());
            dto.setDescripcion(t.getDescripcion());
            dto.setEstado(t.getEstado());
            dto.setPrioridad(t.getPrioridad());
            dto.setFechaCreacion(t.getFechaCreacion());
            dto.setFechaFin(t.getFechaFin());
            dto.setFechaCompletada(t.getFechaCompletada());
            dto.setHorasEstimadas(t.getHorasEstimadas());
            dto.setUsuarioId(t.getUsuario().getId());
            dto.setUsuarioNombre(t.getUsuario().getNombre());
            dto.setIteracionId(t.getIteracion() != null ? t.getIteracion().getIdIteracion() : null);

            Set<CategoriaResponse> categoriasDTO = t.getCategorias().stream()
                    .map(c -> new CategoriaResponse(c.getIdCategoria(), c.getNombre(), c.getDescripcion(),
                            c.getProyecto().getIdProyecto()))
                    .collect(Collectors.toSet());
            dto.setCategorias(categoriasDTO);

            dto.setDependenciasIds(
                    t.getDependencias().stream()
                            .map(Tarea::getIdTarea)
                            .collect(Collectors.toSet()));

            return dto;
        }).toList();
    }

    @GetMapping("/por-proyecto/{idProyecto}")
    public List<TareaResponse> getTareasPorProyecto(@PathVariable Long idProyecto) {
        List<Tarea> tareas = tareaService.listarPorProyecto(idProyecto);
        return tareas.stream().map(t -> {
            TareaResponse dto = new TareaResponse();
            dto.setIdTarea(t.getIdTarea());
            dto.setNombre(t.getNombre());
            dto.setDescripcion(t.getDescripcion());
            dto.setEstado(t.getEstado());
            dto.setPrioridad(t.getPrioridad());
            dto.setFechaCreacion(t.getFechaCreacion());
            dto.setFechaFin(t.getFechaFin());
            dto.setFechaCompletada(t.getFechaCompletada());
            dto.setHorasEstimadas(t.getHorasEstimadas());
            dto.setUsuarioId(t.getUsuario().getId());
            dto.setUsuarioNombre(t.getUsuario().getNombre());
            dto.setIteracionId(t.getIteracion() != null ? t.getIteracion().getIdIteracion() : null);
            dto.setCategorias(t.getCategorias().stream()
                    .map(c -> new CategoriaResponse(c.getIdCategoria(), c.getNombre(), c.getDescripcion(),
                            c.getProyecto().getIdProyecto()))
                    .collect(Collectors.toSet()));
            dto.setDependenciasIds(
                    t.getDependencias().stream()
                            .map(Tarea::getIdTarea)
                            .collect(Collectors.toSet()));
            return dto;
        }).toList();
    }

    @GetMapping("/proyecto/{idProyecto}/iteracion/{idIteracion}")
    public List<TareaResponse> getTareasPorProyectoEIteracion(
            @PathVariable Long idProyecto,
            @PathVariable Long idIteracion) {

        List<Tarea> tareas = tareaService.obtenerTareasPorProyectoYIteracion(idProyecto, idIteracion);

    return tareas.stream().map(t -> {
        TareaResponse dto = new TareaResponse();
        dto.setIdTarea(t.getIdTarea());
        dto.setNombre(t.getNombre());
        dto.setDescripcion(t.getDescripcion());
        dto.setEstado(t.getEstado());
        dto.setPrioridad(t.getPrioridad());
        dto.setFechaCreacion(t.getFechaCreacion());
        dto.setFechaFin(t.getFechaFin());
        dto.setFechaCompletada(t.getFechaCompletada());
        dto.setHorasEstimadas(t.getHorasEstimadas());
        dto.setUsuarioId(t.getUsuario().getId());
        dto.setUsuarioNombre(t.getUsuario().getNombre());
        dto.setIteracionId(t.getIteracion() != null ? t.getIteracion().getIdIteracion() : null);

            dto.setCategorias(t.getCategorias().stream()
                    .map(c -> new CategoriaResponse(
                            c.getIdCategoria(),
                            c.getNombre(),
                            c.getDescripcion(),
                            c.getProyecto().getIdProyecto()))
                    .collect(Collectors.toSet()));

            dto.setDependenciasIds(
                    t.getDependencias().stream()
                            .map(Tarea::getIdTarea)
                            .collect(Collectors.toSet()));

            return dto;
        }).toList();
    }

    @GetMapping("/{id}")
    public Tarea obtener(@PathVariable Long id) {
        return tareaService.obtenerPorId(id);
    }

    @PostMapping
    public TareaRequest guardar(@RequestBody TareaRequest dto) {
        // 1️⃣ Crear la entidad Tarea
        Tarea tarea = new Tarea();
        tarea.setNombre(dto.getNombre());
        tarea.setDescripcion(dto.getDescripcion());
        tarea.setEstado(dto.getEstado());
        if ("Completado".equalsIgnoreCase(dto.getEstado())) {
            tarea.setFechaCompletada(java.time.LocalDate.now());
        }
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
        Iteracion iteracion = iteracionService.obtenerPorId(dto.getIteracionId())
                .orElseThrow(() -> new IllegalArgumentException("Iteración no encontrada con id "));
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

        // Asociar dependencias
        // Asociar dependencias
        Set<Tarea> dependencias = new HashSet<>();
        if (dto.getDependenciasIds() != null) {
            for (Long dependenciaId : dto.getDependenciasIds()) {
                Tarea dependencia = tareaService.obtenerPorId(dependenciaId);
                if (dependencia != null) {
                    dependencias.add(dependencia);
                }
            }
        }
        tarea.setDependencias(dependencias);

        Tarea tareaGuardada = tareaService.guardarTarea(tarea);

        TareaRequest dtoResponse = new TareaRequest();
        dtoResponse.setIdTarea(tareaGuardada.getIdTarea());
        dtoResponse.setNombre(tareaGuardada.getNombre());
        dtoResponse.setDescripcion(tareaGuardada.getDescripcion());
        dtoResponse.setEstado(tareaGuardada.getEstado());
        dtoResponse.setPrioridad(tareaGuardada.getPrioridad());
        dtoResponse.setFechaCreacion(tareaGuardada.getFechaCreacion());
        dtoResponse.setFechaFin(tareaGuardada.getFechaFin());
        dtoResponse.setHorasEstimadas(tareaGuardada.getHorasEstimadas());
        dtoResponse.setUsuarioNombre(tareaGuardada.getUsuario().getNombre());
        dtoResponse.setCategorias(
                tareaGuardada.getCategorias().stream()
                        .map(c -> new CategoriaResponse(c.getIdCategoria(), c.getNombre(), c.getDescripcion(),
                                c.getProyecto().getIdProyecto()))
                        .collect(Collectors.toSet()));

        return dtoResponse;
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping("/{id}")
    public TareaResponse actualizarTarea(@PathVariable Long id, @RequestBody TareaRequest cambios) {

        // ✅ Buscar la tarea existente
        Tarea tarea = tareaService.obtenerPorId(id);
        if (tarea == null) {
            throw new RuntimeException("Tarea no encontrada con id: " + id);
        }

        // ✅ Actualizar solo los campos presentes en el DTO
        if (cambios.getNombre() != null)
            tarea.setNombre(cambios.getNombre());

        if (cambios.getDescripcion() != null)
            tarea.setDescripcion(cambios.getDescripcion());

        if (cambios.getEstado() != null) {
            tarea.setEstado(cambios.getEstado());
            if ("Completado".equalsIgnoreCase(cambios.getEstado())) {
                if (tarea.getFechaCompletada() == null) {
                    tarea.setFechaCompletada(java.time.LocalDate.now());
                }
            } else {
                tarea.setFechaCompletada(null);
            }
        }

        if (cambios.getPrioridad() != null)
            tarea.setPrioridad(cambios.getPrioridad());

        if (cambios.getHorasEstimadas() != null)
            tarea.setHorasEstimadas(cambios.getHorasEstimadas());

        if (cambios.getUsuarioId() != null) {
            Usuario usuario = usuarioService.findById(cambios.getUsuarioId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Usuario no encontrado con id: " + cambios.getUsuarioId()));
            tarea.setUsuario(usuario);
        }

        if (cambios.getIteracionId() != null) {
            Iteracion iteracion = iteracionService.obtenerPorId(cambios.getIteracionId())
                    .orElseThrow(() -> new IllegalArgumentException("Iteración no encontrada con id "));
            if (iteracion != null)
                tarea.setIteracion(iteracion);
        }

        if (cambios.getCategoriaIds() != null) {
            Set<Categoria> categorias = cambios.getCategoriaIds().stream()
                    .map(idCat -> categoriaService.obtenerPorId(idCat).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            tarea.setCategorias(categorias);
        }

        if (cambios.getFechaCreacion() != null) {
            tarea.setFechaCreacion(cambios.getFechaCreacion());
        }

        if (cambios.getFechaFin() != null) {
            tarea.setFechaFin(cambios.getFechaFin());
        }

        if (cambios.getDependenciasIds() != null) {
            // 🚫 Validar auto-dependencia
            // 🚫 Validar auto-dependencia (con chequeo fuerte de tipo)
            boolean tieneAutoDependencia = cambios.getDependenciasIds().stream()
                    .filter(Objects::nonNull)
                    .map(depId -> {
                        try {
                            return Long.valueOf(depId);
                        } catch (Exception e) {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .anyMatch(depId -> depId.equals(id));

            if (tieneAutoDependencia) {
                throw new IllegalArgumentException("Una tarea no puede depender de sí misma.");
            }

            // 🔄 Validar dependencias circulares
            tareaService.validarDependenciasCirculares(id, new ArrayList<>(cambios.getDependenciasIds()));

            Set<Tarea> dependencias = cambios.getDependenciasIds().stream()
                    .map(tareaService::obtenerPorId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            tarea.setDependencias(dependencias);
        }

        // ✅ Guardar la tarea actualizada
        Tarea tareaActualizada = tareaService.guardarTarea(tarea);

        // ✅ Convertir a DTO de salida
        return tareaMapper.toResponse(tareaActualizada);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        tareaService.eliminarTarea(id);
    }

    @GetMapping("/mis-tareas")
    public List<TareaRequest> getTareasAsignadas(Authentication authentication) {
        // 🔐 El objeto Authentication lo llena Spring a partir del JWT
        String username = authentication.getName(); // normalmente el email o nombre de usuario

        Usuario usuario = usuarioService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

        List<Tarea> tareas = tareaService.obtenerTareasPorUsuarioId(usuario.getId());

        return tareas.stream().map(t -> {
            TareaRequest dto = new TareaRequest();
            dto.setIdTarea(t.getIdTarea());
            dto.setNombre(t.getNombre());
            dto.setDescripcion(t.getDescripcion());
            dto.setEstado(t.getEstado());
            dto.setPrioridad(t.getPrioridad());
            dto.setFechaCreacion(t.getFechaCreacion());
            dto.setFechaFin(t.getFechaFin());
            dto.setFechaCompletada(t.getFechaCompletada());
            dto.setHorasEstimadas(t.getHorasEstimadas());
            dto.setUsuarioNombre(t.getUsuario().getNombre());
            dto.setCategorias(
                    t.getCategorias().stream()
                            .map(c -> new CategoriaResponse(c.getIdCategoria(), c.getNombre(), c.getDescripcion(),
                                    c.getProyecto().getIdProyecto()))
                            .collect(Collectors.toSet()));
            dto.setDependenciasIds(
                    t.getDependencias().stream()
                            .map(Tarea::getIdTarea)
                            .collect(Collectors.toSet()));
            return dto;
        }).collect(Collectors.toList());
    }

}
