package com.nextech.kairos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.repository.EtapaRepository;
import com.nextech.kairos.repository.ProyectoRepository;

@Service
@Transactional 
public class EtapaService {
    
    private final EtapaRepository etapaRepository;
    private final ProyectoRepository proyectoRepository;

    @Autowired
    public EtapaService(EtapaRepository etapaRepository, ProyectoRepository proyectoRepository) {
        this.etapaRepository = etapaRepository;
        this.proyectoRepository = proyectoRepository;
    }

    @Transactional(readOnly = true)
    public List<Etapa> findAll() {
        return etapaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Etapa> findById(Long idEtapa) {
        return etapaRepository.findById(idEtapa);
    }
    
    public Etapa save(Etapa etapa) {
        return etapaRepository.save(etapa);
    }

    public void delete(Long idEtapa) {
        etapaRepository.deleteById(idEtapa);
    }

    /**
     * Crea una nueva etapa y la asocia a un proyecto existente.
     * @param etapa Datos de la etapa a crear.
     * @param idProyecto ID del proyecto padre.
     * @return La etapa guardada.
     */
    public Etapa createEtapa(Etapa etapa, Long idProyecto) {
        //verificar que el proyecto existe
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
            .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con ID: " + idProyecto));
        
        if (etapaRepository.findByProyectoIdProyectoAndNombre(idProyecto, etapa.getNombre()).isPresent()) {
            throw new RuntimeException("Ya existe una etapa con el nombre '" + etapa.getNombre() + "' en este proyecto.");
        }
        
        if (etapa.getFechaInicio() != null && etapa.getFechaFin() != null && etapa.getFechaInicio().isAfter(etapa.getFechaFin())) {
            throw new RuntimeException("La fecha de inicio no puede ser posterior a la fecha de fin.");
        }
        
        etapa.setProyecto(proyecto);
        return etapaRepository.save(etapa);
    }

    /**
     * Actualiza una etapa existente
     */
    public Etapa updateEtapa(Long idEtapa, Etapa detallesEtapa) {
        return etapaRepository.findById(idEtapa).map(etapaExistente -> {
            Long idProyecto = etapaExistente.getProyecto().getIdProyecto();

            if (!etapaExistente.getNombre().equals(detallesEtapa.getNombre())) {
                if (etapaRepository.findByProyectoIdProyectoAndNombre(idProyecto, detallesEtapa.getNombre()).isPresent()) {
                    throw new RuntimeException("Ya existe otra etapa con el nombre '" + detallesEtapa.getNombre() + "' en este proyecto.");
                }
                etapaExistente.setNombre(detallesEtapa.getNombre());
            }

            etapaExistente.setFechaInicio(detallesEtapa.getFechaInicio());
            etapaExistente.setFechaFin(detallesEtapa.getFechaFin());
            
            if (etapaExistente.getFechaInicio() != null && etapaExistente.getFechaFin() != null && 
                etapaExistente.getFechaInicio().isAfter(etapaExistente.getFechaFin())) {
                throw new RuntimeException("La fecha de inicio no puede ser posterior a la fecha de fin.");
            }
            
            return etapaRepository.save(etapaExistente);
            
        }).orElseThrow(() -> new RuntimeException("Etapa no encontrada con ID: " + idEtapa));
    }


    @Transactional(readOnly = true)
    public List<Etapa> findEtapasByProyecto(Long idProyecto) {
        return etapaRepository.findByProyectoIdProyecto(idProyecto);
    }

    @Transactional(readOnly = true)
    public List<Etapa> findEtapasActivas() {
        return etapaRepository.findByFechaFinIsNullOrFechaFinAfter(LocalDate.now());
    }
    
    @Transactional(readOnly = true)
    public List<Etapa> searchEtapasByNombre(String nombre) {
        return etapaRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    @Transactional(readOnly = true)
    public Set<Iteracion> getIteracionesByEtapaId(Long idEtapa) {
        Etapa etapa = etapaRepository.findById(idEtapa)
            .orElseThrow(() -> new RuntimeException("Etapa no encontrada."));
        return etapa.getIteraciones(); 
    }
}