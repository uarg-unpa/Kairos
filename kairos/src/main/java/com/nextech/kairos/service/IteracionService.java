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
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.repository.EtapaRepository;
import com.nextech.kairos.repository.IteracionRepository;

@Service
@Transactional 
public class IteracionService {
    
    private final IteracionRepository iteracionRepository;
    private final EtapaRepository etapaRepository;

    @Autowired
    public IteracionService(IteracionRepository iteracionRepository, EtapaRepository etapaRepository) {
        this.iteracionRepository = iteracionRepository;
        this.etapaRepository = etapaRepository;
    }

    @Transactional(readOnly = true)
    public List<Iteracion> findAll() {
        return iteracionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Iteracion> findById(Long idIteracion) {
        return iteracionRepository.findById(idIteracion);
    }
    
    public Iteracion save(Iteracion iteracion) {
        return iteracionRepository.save(iteracion);
    }

    public void delete(Long idIteracion) {
        iteracionRepository.deleteById(idIteracion);
    }

    /**
     * Crea una nueva iteración y la asocia a una etapa existente
     * @param iteracion Datos de la iteración a crear.
     * @param idEtapa ID de la etapa padre.
     * @return La iteración guardada.
     */
    public Iteracion createIteracion(Iteracion iteracion, Long idEtapa) {
        //verificar si la etapa existe
        Etapa etapa = etapaRepository.findById(idEtapa)
            .orElseThrow(() -> new RuntimeException("Etapa no encontrada con ID: " + idEtapa));
        
        //validar que el número de iteración sea único dentro de la etapa
        if (iteracion.getNumero() != null && 
            iteracionRepository.findByEtapaIdEtapaAndNumero(idEtapa, iteracion.getNumero()).isPresent()) {
            throw new RuntimeException("Ya existe una iteración con el número " + iteracion.getNumero() + " en esta etapa.");
        }
        
        if (iteracion.getFechaInicio() != null && iteracion.getFechaFin() != null && 
            iteracion.getFechaInicio().isAfter(iteracion.getFechaFin())) {
            throw new RuntimeException("La fecha de inicio no puede ser posterior a la fecha de fin.");
        }
        iteracion.setEtapa(etapa);
        return iteracionRepository.save(iteracion);
    }

    /**
     * Actualiza una iteración existente
     */
    public Iteracion updateIteracion(Long idIteracion, Iteracion detallesIteracion) {
        return iteracionRepository.findById(idIteracion).map(iteracionExistente -> {
            
            if (detallesIteracion.getNumero() != null && 
                !detallesIteracion.getNumero().equals(iteracionExistente.getNumero())) {
                
                Long idEtapa = iteracionExistente.getEtapa().getIdEtapa();
                if (iteracionRepository.findByEtapaIdEtapaAndNumero(idEtapa, detallesIteracion.getNumero())
                                       .filter(i -> !i.getIdIteracion().equals(idIteracion)) // Ignorar la propia iteración
                                       .isPresent()) {
                    throw new RuntimeException("Ya existe otra iteración con el número " + detallesIteracion.getNumero() + " en esta etapa.");
                }
                iteracionExistente.setNumero(detallesIteracion.getNumero());
            }
            iteracionExistente.setDescripcion(detallesIteracion.getDescripcion());
            iteracionExistente.setFechaInicio(detallesIteracion.getFechaInicio());
            iteracionExistente.setFechaFin(detallesIteracion.getFechaFin());
            
            if (iteracionExistente.getFechaInicio() != null && iteracionExistente.getFechaFin() != null && 
                iteracionExistente.getFechaInicio().isAfter(iteracionExistente.getFechaFin())) {
                throw new RuntimeException("La fecha de inicio no puede ser posterior a la fecha de fin.");
            }
            
            return iteracionRepository.save(iteracionExistente);
            
        }).orElseThrow(() -> new RuntimeException("Iteración no encontrada con ID: " + idIteracion));
    }

    @Transactional(readOnly = true)
    public List<Iteracion> findIteracionesByEtapa(Long idEtapa) {
        return iteracionRepository.findByEtapaIdEtapa(idEtapa);
    }

    @Transactional(readOnly = true)
    public List<Iteracion> findIteracionesTerminadas() {
        return iteracionRepository.findByFechaFinLessThanEqual(LocalDate.now());
    }
    
    @Transactional(readOnly = true)
    public Set<Tarea> getTareasByIteracionId(Long idIteracion) {
        Iteracion iteracion = iteracionRepository.findById(idIteracion)
            .orElseThrow(() -> new RuntimeException("Iteración no encontrada."));
        return iteracion.getTareas(); 
    }
}