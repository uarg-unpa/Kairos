package com.nextech.kairos.mapper;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.nextech.kairos.dto.CategoriaResponse;
import com.nextech.kairos.dto.TareaRequest;
import com.nextech.kairos.dto.TareaResponse;
import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.service.ICategoriaService;
import com.nextech.kairos.service.IIteracionService;
import com.nextech.kairos.service.ITareaService;
import com.nextech.kairos.service.UsuarioService;

@Component
public class TareaMapper {
    @Autowired
    private final UsuarioService usuarioService;
    @Autowired
    private final IIteracionService iteracionService;
    @Autowired
    private final ICategoriaService categoriaService;
    @Autowired
    private final ITareaService tareaService;

    public TareaMapper(UsuarioService usuarioService, IIteracionService iteracionService, 
                      ICategoriaService categoriaService, ITareaService tareaService) {
        this.usuarioService = usuarioService;
        this.iteracionService = iteracionService;
        this.categoriaService = categoriaService;
        this.tareaService = tareaService;
    }

    public TareaResponse toResponse(Tarea tarea) {
        if (tarea == null) return null;

        TareaResponse dto = new TareaResponse();
        dto.setIdTarea(tarea.getIdTarea());
        dto.setNombre(tarea.getNombre());
        dto.setDescripcion(tarea.getDescripcion());
        dto.setEstado(tarea.getEstado());
        dto.setPrioridad(tarea.getPrioridad());
        dto.setFechaCreacion(tarea.getFechaCreacion());
        dto.setFechaFin(tarea.getFechaFin());
        dto.setHorasEstimadas(tarea.getHorasEstimadas());

        if (tarea.getUsuario() != null) {
            dto.setUsuarioId(tarea.getUsuario().getId());
            dto.setUsuarioNombre(tarea.getUsuario().getNombre());
        }

        if (tarea.getIteracion() != null) {
            dto.setIteracionId(tarea.getIteracion().getIdIteracion());
        }

        if (tarea.getCategorias() != null) {
            dto.setCategorias(tarea.getCategorias().stream()
                .map(cat -> new CategoriaResponse(cat.getIdCategoria(), cat.getNombre(), 
                     cat.getDescripcion(), cat.getProyecto().getIdProyecto()))
                .collect(Collectors.toSet()));
        }

        if (tarea.getDependencias() != null) {
            dto.setDependenciasIds(tarea.getDependencias().stream()
                .map(Tarea::getIdTarea)
                .collect(Collectors.toSet()));
        }

        return dto;
    }

    public Tarea toEntity(TareaRequest req) {
        if (req == null) return null;

        Tarea tarea = new Tarea();
        tarea.setIdTarea(req.getIdTarea());
        tarea.setNombre(req.getNombre());
        tarea.setDescripcion(req.getDescripcion());
        tarea.setEstado(req.getEstado());
        tarea.setPrioridad(req.getPrioridad());
        tarea.setFechaCreacion(req.getFechaCreacion());
        tarea.setFechaFin(req.getFechaFin());
        tarea.setHorasEstimadas(req.getHorasEstimadas());

        if (req.getUsuarioId() != null) {
            tarea.setUsuario(usuarioService.findById(req.getUsuarioId()).orElse(null));
        }

        if (req.getIteracionId() != null) {
            tarea.setIteracion(iteracionService.obtenerPorId(req.getIteracionId()).orElseThrow(() -> new IllegalArgumentException("Iteración no encontrada con id ")));
        }

         Set<Categoria> categorias = new HashSet<>();
        if (req.getCategoriaIds() != null) {
            for (Long idCat : req.getCategoriaIds()) {
                Categoria cat = categoriaService.obtenerPorId(idCat).orElse(null);
                if (cat != null) {
                    categorias.add(cat);
                }
            }
        }
        tarea.setCategorias(categorias);

        if (req.getDependenciasIds() != null && !req.getDependenciasIds().isEmpty()) {
            Set<Tarea> dependencias = req.getDependenciasIds().stream()
                .map(tareaService::obtenerPorId)
                .collect(Collectors.toSet());
            tarea.setDependencias(dependencias);
        }

        return tarea;
    }
}
