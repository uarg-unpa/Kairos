package com.nextech.kairos.mapper;

import com.nextech.kairos.dto.CategoriaDTO;
import com.nextech.kairos.model.Categoria;

public class CategoriaMapper {

    // Convierte una entidad Categoria a CategoriaDTO
    public static CategoriaDTO toDTO(Categoria categoria) {
        if (categoria == null) return null;
        return new CategoriaDTO(categoria.getIdCategoria(), categoria.getNombre(), categoria.getDescripcion());
    }
}
