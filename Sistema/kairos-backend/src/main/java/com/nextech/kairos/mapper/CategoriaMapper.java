package com.nextech.kairos.mapper;


import org.springframework.stereotype.Component;

import com.nextech.kairos.dto.CategoriaRequest;
import com.nextech.kairos.dto.CategoriaResponse;
import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.service.IProyectoService;

@Component
public class CategoriaMapper {

    private final IProyectoService proyectoService;

    public CategoriaMapper(IProyectoService proyectoService) {
        this.proyectoService = proyectoService;
    }

    // Convierte una entidad Categoria a CategoriaResponse
    public CategoriaResponse toResponse(Categoria categoria) {
        if (categoria == null) return null;
        return new CategoriaResponse(
            categoria.getIdCategoria(),
            categoria.getNombre(),
            categoria.getDescripcion(),
            categoria.getProyecto() != null ? categoria.getProyecto().getIdProyecto() : null
        );
    }

    // Convierte un CategoriaRequest a una entidad Categoria
    public Categoria toEntity(CategoriaRequest categoriaRequest) {
        if (categoriaRequest == null) return null;

        Categoria categoria = new Categoria();
        categoria.setNombre(categoriaRequest.getNombre());
        categoria.setDescripcion(categoriaRequest.getDescripcion());
        categoria.setProyecto(
            proyectoService.findById(categoriaRequest.getIdProyecto())
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con ID: " + categoriaRequest.getIdProyecto()))
        );

        return categoria;
    }
}
