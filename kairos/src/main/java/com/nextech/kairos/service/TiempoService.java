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
import com.nextech.kairos.repository.TiempoRepository;

@Service
@Transactional 
public class TiempoService {
    
    private final TiempoRepository tiempoRepository;
    private final UsuarioService usuarioService; 
    private final TareaService tareaService;

    @Autowired
    public TiempoService(
        TiempoRepository tiempoRepository,
        UsuarioService usuarioService,
        TareaService tareaService) {//inyyeccion de servicios
        
        this.tiempoRepository = tiempoRepository;
        this.usuarioService = usuarioService;
        this.tareaService = tareaService;
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
     * Crea un nuevo registro de tiempo asociado a una tarea y un usuario
     * Este mǸtodo estǭ dise��ado para ser llamado por el controlador al detener el cronometro
     * * @param tiempo Entidad Tiempo a persistir.
     * @param idTarea ID de la tarea obligatoria.
     * @param idUsuario ID del usuario logueado (obligatorio!!).
     * @param duracionSegundos Duraci��n total del registro en segundos
     * @param fechaRegistro Fecha del registro
     * @param descripcion Descripci��n del trabajo realizado
     * @return El registro de tiempo guardado.
     */
    public Tiempo registerTime(
        Tiempo tiempo, 
        Long idTarea, 
        Long idUsuario, 
        Integer duracionSegundos, 
        LocalDate fechaRegistro,
        String descripcion 
        ) {
        
        Tarea tarea = tareaService.findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + idTarea));
        
        Usuario usuario = usuarioService.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        
        if (duracionSegundos == null || duracionSegundos < 1) {
            throw new RuntimeException("La duraci��n registrada debe ser de al menos 1 segundo.");
        }
        
        // Persistimos en minutos, redondeando hacia arriba para no perder registros cortos
        int duracionMinutos = (int) Math.ceil(duracionSegundos / 60.0);

        tiempo.setTarea(tarea);
        tiempo.setUsuario(usuario);
        tiempo.setDuracion(duracionMinutos);
        //opcional, pendiente
        // tiempo.setDescripcion(descripcion); 
        
        if (tiempo.getFechaRegistro() == null) {
            tiempo.setFechaRegistro(LocalDate.now());
        } else {
            tiempo.setFechaRegistro(fechaRegistro);
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
             throw new IllegalArgumentException("Rango de fechas invǭlido.");
        }
        return tiempoRepository.findByFechaRegistroBetween(fechaInicio, fechaFin);
    }
    
    /**
     * Calcula la suma total de la duraci��n del tiempo registrado para una tarea espec��fica
     * @param idTarea ID de la tarea
     * @return Duraci��n total
     */
    @Transactional(readOnly = true)
    public Integer calculateTotalTimeByTask(Long idTarea) {
        return tiempoRepository.findByTareaIdTarea(idTarea).stream()
            .mapToInt(Tiempo::getDuracion)
            .sum();
    }
}

