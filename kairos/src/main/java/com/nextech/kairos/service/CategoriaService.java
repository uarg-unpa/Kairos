package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.repository.CategoriaRepository;
import com.nextech.kairos.repository.ProyectoRepository;

@Service // ¡NECESARIA para que Spring lo registre!
@Transactional
 
public class CategoriaService implements ICategoriaService { 
    
    private final CategoriaRepository categoriaRepository;
    private final ProyectoRepository proyectoRepository; 

    @Autowired
    public CategoriaService(CategoriaRepository categoriaRepository, ProyectoRepository proyectoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.proyectoRepository = proyectoRepository;
    }

    // --- MÉTODOS DE ICategoriaService ---
    
    @Override
    @Transactional(readOnly = true)
    public List<Categoria> listarCategorias() {
        // Tu método original se llama findAll
        return categoriaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Categoria> obtenerPorId(Long id) {
        // Tu método original se llama findById
        return categoriaRepository.findById(id);
    }
    
    @Override
    public Categoria guardarCategoria(Categoria categoria) {
        // Tu método original se llama save
        return categoriaRepository.save(categoria);
    }
    
    @Override
    public Categoria crearCategoria(Categoria categoria, Long idProyecto) {
        // Lógica de creación robusta de tu código original
        Optional<Proyecto> proyectoOpt = proyectoRepository.findById(idProyecto);
        if (proyectoOpt.isEmpty()) {
            throw new RuntimeException("Proyecto no encontrado con ID: " + idProyecto);
        }
        
        Proyecto proyecto = proyectoOpt.get();
        List<Categoria> categoriasExistentes = categoriaRepository.findByProyectoIdProyectoAndNombre(idProyecto, categoria.getNombre());
        if (!categoriasExistentes.isEmpty()) {
            throw new RuntimeException("Ya existe una categoría con el nombre '" + categoria.getNombre() + "' en este proyecto.");
        }
        
        categoria.setProyecto(proyecto);
        return categoriaRepository.save(categoria);
    }
    
    @Override
    public Categoria actualizarCategoria(Long id, Categoria detallesCategoria) {
        // Lógica de actualización robusta de tu código original
        return categoriaRepository.findById(id).map(categoriaExistente -> {
            
            if (!categoriaExistente.getNombre().equals(detallesCategoria.getNombre())) {
                Long idProyecto = categoriaExistente.getProyecto().getIdProyecto();
                List<Categoria> categoriasExistentes = categoriaRepository.findByProyectoIdProyectoAndNombre(idProyecto, detallesCategoria.getNombre());
                
                boolean nombreDuplicado = categoriasExistentes.stream().anyMatch(c -> !c.getIdCategoria().equals(id));
                    
                if (nombreDuplicado) {
                    throw new RuntimeException("Ya existe una categoría con el nombre '" + detallesCategoria.getNombre() + "' en este proyecto.");
                }
            }
            
            categoriaExistente.setNombre(detallesCategoria.getNombre());
            categoriaExistente.setDescripcion(detallesCategoria.getDescripcion());
            
            return categoriaRepository.save(categoriaExistente);
            
        }).orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
    }

    @Override
    public void eliminarCategoria(Long id) {
        // Tu método original se llama delete
        categoriaRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Categoria> buscarPorNombre(String nombre) {
        // Tu método original se llama findByNombre
        return categoriaRepository.findByNombre(nombre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> buscarPorProyecto(Long idProyecto) {
        // Tu método original se llama findCategoriasByProyecto
        return categoriaRepository.findByProyectoIdProyecto(idProyecto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> buscarPorNombreContiene(String nombre) {
        // Tu método original se llama searchCategoriasByNombre
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> buscarPorProyectoYNombre(Long idProyecto, String nombre) {
        // Este método viene de tu repositorio, lo mapeamos al List<>
        return categoriaRepository.findByProyectoIdProyectoAndNombre(idProyecto, nombre).stream().toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> buscarPorTarea(Long idTarea) {
        return categoriaRepository.findByTareas_IdTarea(idTarea);
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPorProyecto(Long idProyecto) {
        return categoriaRepository.countByProyectoIdProyecto(idProyecto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Set<Tarea> obtenerTareasPorCategoriaId(Long idCategoria) {
        // Tu método original se llama getTareasByCategoriaId
        Optional<Categoria> categoriaOpt = categoriaRepository.findById(idCategoria);
        if (categoriaOpt.isEmpty()) {
            throw new RuntimeException("Categoría no encontrada con ID: " + idCategoria);
        }
        return categoriaOpt.get().getTareas();
    }
}
