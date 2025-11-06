package com.nextech.kairos.mapper;

import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.dto.CategoriaDTO;

public class CategoriaMapper {

    // Convierte una entidad Categoria a CategoriaDTO
    public static CategoriaDTO toDTO(Categoria categoria) {
        if (categoria == null) return null;
        return new CategoriaDTO(categoria.getIdCategoria(), categoria.getNombre(), categoria.getDescripcion());
    }
}
