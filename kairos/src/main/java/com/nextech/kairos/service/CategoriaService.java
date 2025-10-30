package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.repository.CategoriaRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CategoriaService implements ICategoriaService {

    private final CategoriaRepository categoriaRepository;
    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    @Override
    public Optional<Categoria> obtenerPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    @Override
    public Categoria guardarCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Override
    public Categoria actualizarCategoria(Long id, Categoria datos) {
        return categoriaRepository.findById(id)
                .map(categoria -> {
                    categoria.setNombre(datos.getNombre());
                    categoria.setDescripcion(datos.getDescripcion());
                    categoria.setProyecto(datos.getProyecto());
                    return categoriaRepository.save(categoria);
                })
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
    }

    @Override
    public void eliminarCategoria(Long id) {
        if (categoriaRepository.existsById(id)) {
            categoriaRepository.deleteById(id);
        } else {
            throw new RuntimeException("No se encontró la categoría con ID: " + id);
        }
    }

    @Override
    public Optional<Categoria> buscarPorNombre(String nombre) {
        return categoriaRepository.findByNombre(nombre);
    }

    @Override
    public List<Categoria> buscarPorProyecto(Long idProyecto) {
        return categoriaRepository.findByProyectoIdProyecto(idProyecto);
    }

    @Override
    public List<Categoria> buscarPorNombreContiene(String nombre) {
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    public List<Categoria> buscarPorProyectoYNombre(Long idProyecto, String nombre) {
        return categoriaRepository.findByProyectoIdProyectoAndNombre(idProyecto, nombre);
    }

    @Override
    public List<Categoria> buscarPorTarea(Long idTarea) {
        return categoriaRepository.findByTareas_IdTarea(idTarea);
    }

    @Override
    public long contarPorProyecto(Long idProyecto) {
        return categoriaRepository.countByProyectoIdProyecto(idProyecto);
    }
}
