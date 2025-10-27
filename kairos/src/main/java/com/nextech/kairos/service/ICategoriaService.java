package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;

import com.nextech.kairos.model.Categoria;

public interface ICategoriaService {
    
    List<Categoria> listarCategorias();

    Optional<Categoria> obtenerPorId(Long id);

    Categoria guardarCategoria(Categoria categoria);

    Categoria actualizarCategoria(Long id, Categoria categoria);

    void eliminarCategoria(Long id);

    Optional<Categoria> buscarPorNombre(String nombre);

    List<Categoria> buscarPorProyecto(Long idProyecto);

    List<Categoria> buscarPorNombreContiene(String nombre);

    List<Categoria> buscarPorProyectoYNombre(Long idProyecto, String nombre);

    List<Categoria> buscarPorTarea(Long idTarea);

    long contarPorProyecto(Long idProyecto);
}

