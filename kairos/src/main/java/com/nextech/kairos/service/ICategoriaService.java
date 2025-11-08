package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Tarea;

public interface ICategoriaService {
    
    List<Categoria> listarCategorias();

    Optional<Categoria> obtenerPorId(Long id);

    /**
     * Guarda una Categoría. Se utiliza internamente.
     */
    Categoria guardarCategoria(Categoria categoria); 
    
    /**
     * Crea una nueva categoría y la asocia a un proyecto, validando la unicidad del nombre.
     */
    Categoria crearCategoria(Categoria categoria, Long idProyecto); // Nuevo método

    /**
     * Actualiza una categoría existente, validando la unicidad del nombre si este cambia.
     */
    Categoria actualizarCategoria(Long id, Categoria categoria);

    void eliminarCategoria(Long id);

    Optional<Categoria> buscarPorNombre(String nombre);

    List<Categoria> buscarPorProyecto(Long idProyecto);

    List<Categoria> buscarPorNombreContiene(String nombre);

    List<Categoria> buscarPorProyectoYNombre(Long idProyecto, String nombre);

    List<Categoria> buscarPorTarea(Long idTarea);

    long contarPorProyecto(Long idProyecto);
    
    /**
     * Obtiene el conjunto de tareas asociadas a una categoría específica.
     */
    Set<Tarea> obtenerTareasPorCategoriaId(Long idCategoria); // Nuevo método
}
