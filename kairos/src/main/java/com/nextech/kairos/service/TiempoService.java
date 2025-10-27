package com.nextech.kairos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Tiempo;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.TareaRepository;
import com.nextech.kairos.repository.TiempoRepository;
import com.nextech.kairos.repository.UsuarioRepository;

@Service
@Transactional 
public class TiempoService {
    
    private final TiempoRepository tiempoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TareaRepository tareaRepository;

    @Autowired
    public TiempoService(
        TiempoRepository tiempoRepository,
        UsuarioRepository usuarioRepository,
        TareaRepository tareaRepository) {
        
        this.tiempoRepository = tiempoRepository;
        this.usuarioRepository = usuarioRepository;
        this.tareaRepository = tareaRepository;
    }
    @Transactional(readOnly = true)
    public List<Tiempo> findAll() {
        return tiempoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Tiempo> findById(Long idTiempo) {
        return tiempoRepository.findById(idTiempo);
    }
    
    /**
     * Crea un nuevo registro de tiempo asociado a una tarea
     * @param tiempo El objeto Tiempo a guardar.
     * @param idTarea ID de la tarea obligatoria.
     * @param idUsuario ID del usuario opcional.
     * @return El registro de tiempo guardado.
     */
    public Tiempo registerTime(Tiempo tiempo, Long idTarea, Long idUsuario) {
        // 1. Validar la Tarea (Obligatoria)
        Tarea tarea = tareaRepository.findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + idTarea));
         Usuario usuario = null;
        if (idUsuario != null) {
            usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        }

        //la duración debe ser positiva
        if (tiempo.getDuracion() == null || tiempo.getDuracion() <= 0) {
            throw new RuntimeException("La duración del tiempo registrado debe ser mayor a cero.");
        }
        
        tiempo.setTarea(tarea);
        tiempo.setUsuario(usuario);
        
        if (tiempo.getFechaRegistro() == null) {
            tiempo.setFechaRegistro(LocalDate.now());
        }
        
        return tiempoRepository.save(tiempo);
    }

    public void delete(Long idTiempo) {
        tiempoRepository.deleteById(idTiempo);
    }

    @Transactional(readOnly = true)
    public List<Tiempo> findTimeByTask(Long idTarea) {
        return tiempoRepository.findByTareaIdTarea(idTarea);
    }

    @Transactional(readOnly = true)
    public List<Tiempo> findTimeByUser(Long idUsuario) {
        return tiempoRepository.findByUsuarioId(idUsuario);
    }

    @Transactional(readOnly = true)
    public List<Tiempo> findTimeForTaskAndUser(Long idTarea, Long idUsuario) {
        return tiempoRepository.findByTareaIdTareaAndUsuarioId(idTarea, idUsuario);
    }
    
    @Transactional(readOnly = true)
    public List<Tiempo> findTimeByDateRange(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaInicio == null || fechaFin == null || fechaInicio.isAfter(fechaFin)) {
             throw new IllegalArgumentException("Rango de fechas inválido.");
        }
        return tiempoRepository.findByFechaRegistroBetween(fechaInicio, fechaFin);
    }
    
    /**
     * Calcula la suma total de la duración del tiempo registrado para una tarea específica.
     * @param idTarea ID de la tarea.
     * @return Duración total
     */
    @Transactional(readOnly = true)
    public Integer calculateTotalTimeByTask(Long idTarea) {
        return tiempoRepository.findByTareaIdTarea(idTarea).stream()
            .mapToInt(Tiempo::getDuracion)
            .sum();
    }
}