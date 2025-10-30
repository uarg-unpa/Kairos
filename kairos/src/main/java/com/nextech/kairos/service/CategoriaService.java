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

@Service
@Transactional
public class CategoriaService {
    
    private final CategoriaRepository categoriaRepository;
    private final ProyectoRepository proyectoRepository;

    @Autowired
    public CategoriaService(CategoriaRepository categoriaRepository, ProyectoRepository proyectoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.proyectoRepository = proyectoRepository;
    }

    @Transactional(readOnly = true)
    public List<Categoria> findAll() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Categoria> findById(Long id) {
        return categoriaRepository.findById(id);
    }
    
    public Categoria save(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public void delete(Long id) {
        categoriaRepository.deleteById(id);
    }

    /**
     * crea una nueva categoría y la asocia a un proyecto existente
     * @param categoria categoría a crear
     * @param idProyecto ID del proyecto al que se asocia
     * @return categoría guardada
     */
    public Categoria createCategoria(Categoria categoria, Long idProyecto) {
        // verificar si el proyecto existe
        Optional<Proyecto> proyectoOpt = proyectoRepository.findById(idProyecto);
        if (proyectoOpt.isEmpty()) {
            throw new RuntimeException("Proyecto no encontrado con ID: " + idProyecto);
        }
        
        Proyecto proyecto = proyectoOpt.get();
        
        // verificar unicidad de nombre de la categoría dentro del proyecto
        List<Categoria> categoriasExistentes = categoriaRepository.findByProyectoIdProyectoAndNombre(idProyecto, categoria.getNombre());
        if (!categoriasExistentes.isEmpty()) {
            throw new RuntimeException("Ya existe una categoría con el nombre '" + categoria.getNombre() + "' en este proyecto.");
        }
        
        // establecer la relación y guardar
        categoria.setProyecto(proyecto);
        return categoriaRepository.save(categoria);
    }

    /**
     * actualiza una categoría existente
     * @param idCategoria ID de la categoría a actualizar.
     * @param detallesCategoria Datos para actualizar (nombre, descripción)
     * @return actualizacion
     */
    public Categoria updateCategoria(Long idCategoria, Categoria detallesCategoria) {
        return categoriaRepository.findById(idCategoria).map(categoriaExistente -> {
            
            // si el nombre cambia, volver a validar la unicidad dentro del proyecto
            if (!categoriaExistente.getNombre().equals(detallesCategoria.getNombre())) {
                Long idProyecto = categoriaExistente.getProyecto().getIdProyecto();
                List<Categoria> categoriasExistentes = categoriaRepository.findByProyectoIdProyectoAndNombre(idProyecto, detallesCategoria.getNombre());
                
                if (!categoriasExistentes.isEmpty()) {
                    throw new RuntimeException("Ya existe una categoría con el nombre '" + detallesCategoria.getNombre() + "' en este proyecto.");
                }
            }
            
            // actualizar campos
            categoriaExistente.setNombre(detallesCategoria.getNombre());
            categoriaExistente.setDescripcion(detallesCategoria.getDescripcion());
            
            return categoriaRepository.save(categoriaExistente);
            
        }).orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + idCategoria));
    }

    @Transactional(readOnly = true)
    public List<Categoria> findCategoriasByProyecto(Long idProyecto) {
        return categoriaRepository.findByProyectoIdProyecto(idProyecto);
    }

    @Transactional(readOnly = true)
    public List<Categoria> searchCategoriasByNombre(String nombre) {
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    @Transactional(readOnly = true)
    public Set<Tarea> getTareasByCategoriaId(Long idCategoria) {
        Optional<Categoria> categoriaOpt = categoriaRepository.findById(idCategoria);
        if (categoriaOpt.isEmpty()) {
            throw new RuntimeException("Categoría no encontrada con ID: " + idCategoria);
        }
        return categoriaOpt.get().getTareas();
    }
}