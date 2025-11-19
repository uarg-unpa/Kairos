package com.nextech.kairos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.dto.TiempoEditRequestDTO;
import com.nextech.kairos.dto.TiempoResponseDTO;
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
            TareaService tareaService) {

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
     * Crea un nuevo registro de tiempo asociado a una tarea y un usuario.
     * Este método está diseñado para ser llamado por el controlador al detener el
     * cronómetro o al registrar tiempo manual.
     * * @param tiempo Entidad Tiempo a persistir.
     * @param idTarea ID de la tarea obligatoria.
     * @param idUsuario ID del usuario logueado (obligatorio!!).
     * @param duracionSegundos Duración total del registro en segundos
     * @param fechaRegistro Fecha del registro
     * @param descripcion Descripción del trabajo realizado
     * @return El registro de tiempo guardado.
     */
    public Tiempo registerTime(
            Tiempo tiempo,
            Long idTarea,
            Long idUsuario,
            Integer duracionSegundos,
            LocalDate fechaRegistro,
            String descripcion) {

        Tarea tarea = tareaService.obtenerPorId(idTarea);
        if (tarea == null) {
            throw new RuntimeException("Tarea no encontrada con ID: " + idTarea);
        }
        
        // 🚨 VALIDACIÓN CU21 Extensión 4a: No registrar tiempo en tareas finalizadas
        if ("Completado".equalsIgnoreCase(tarea.getEstado()) || "Finalizado".equalsIgnoreCase(tarea.getEstado())) {
            throw new IllegalStateException("No se puede registrar tiempo en una tarea con estado '" + tarea.getEstado() + "'.");
        }

        Usuario usuario = usuarioService.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        if (duracionSegundos == null || duracionSegundos < 1) {
            throw new RuntimeException("La duración registrada debe ser de al menos 1 segundo.");
        }

        // Persistimos en minutos, redondeando hacia arriba para no perder registros
        // cortos
        int duracionMinutos = (int) Math.ceil(duracionSegundos / 60.0);

        tiempo.setTarea(tarea);
        tiempo.setUsuario(usuario);
        tiempo.setDuracion(duracionMinutos);
        // La entidad Tiempo.java no tiene campo descripcion, por lo que este campo se ignora por ahora
        // tiempo.setDescripcion(descripcion);

        if (fechaRegistro == null) {
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
            throw new IllegalArgumentException("Rango de fechas inválido.");
        }
        return tiempoRepository.findByFechaRegistroBetween(fechaInicio, fechaFin);
    }
    @Transactional(readOnly = true)
public List<TiempoResponseDTO> findLast5ByUsuarioId(Long idUsuario) {
    PageRequest pageable = PageRequest.of(0, 5);
    return tiempoRepository.findLast5ByUsuarioId(idUsuario, pageable).stream()
        .map(t -> new TiempoResponseDTO(
            t.getIdTiempo(),
            t.getTarea().getNombre(),
            t.getDuracion(),
            t.getFechaRegistro(),
            null // descripcion no existe aún
        ))
        .collect(Collectors.toList());
}

@Transactional
public Tiempo updateTime(Long idTiempo, TiempoEditRequestDTO request, Long idUsuario) {
    Tiempo tiempo = tiempoRepository.findById(idTiempo)
        .orElseThrow(() -> new RuntimeException("Tiempo no encontrado: " + idTiempo));

    if (!tiempo.getUsuario().getId().equals(idUsuario)) {
        throw new RuntimeException("No tienes permiso para editar este registro.");
    }

    if (request.getDuracionMinutos() < 1) {
        throw new IllegalArgumentException("La duración debe ser al menos 1 minuto.");
    }

    tiempo.setDuracion(request.getDuracionMinutos());
    tiempo.setFechaRegistro(request.getFechaRegistro());
    // tiempo.setDescripcion(...) → si agregas el campo después

    return tiempoRepository.save(tiempo);
}

    /**
     * Calcula la suma total de la duración del tiempo registrado para una tarea
     * específica
     * * @param idTarea ID de la tarea
     * @return Duración total
     */
    @Transactional(readOnly = true)
    public Integer calculateTotalTimeByTask(Long idTarea) {
        return tiempoRepository.findByTareaIdTarea(idTarea).stream()
                .mapToInt(Tiempo::getDuracion)
                .sum();
    }

    @Transactional(readOnly = true)
    public java.util.Map<Long, Integer> getTiemposTotalesPorUsuario(Long idUsuario) {
        List<Object[]> results = tiempoRepository.sumHorasPorTareaUsuario(idUsuario);
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Number) row[1]).intValue()
                ));
    }

    // Agregaciones para dashboard
    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorIteracionGlobal() {
        return tiempoRepository.sumHorasPorIteracionGlobal();
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorIteracionEnEtapa(Long etapaId) {
        return tiempoRepository.sumHorasPorIteracionEnEtapa(etapaId);
    }
    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorIteracionEnProyecto(Long proyectoId) {
        return tiempoRepository.sumHorasPorIteracionEnProyecto(proyectoId);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorIteracionGlobalRango(LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorIteracionGlobalRango(desde, hasta);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorIteracionEnEtapaRango(Long etapaId, LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorIteracionEnEtapaRango(etapaId, desde, hasta);
    }
    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorIteracionEnProyectoRango(Long proyectoId, LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorIteracionEnProyectoRango(proyectoId, desde, hasta);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorUsuarioGlobal() {
        return tiempoRepository.sumHorasPorUsuarioGlobal();
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorUsuarioEnIteracion(Long iteracionId) {
        return tiempoRepository.sumHorasPorUsuarioEnIteracion(iteracionId);
    }
    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorUsuarioEnProyecto(Long proyectoId) {
        return tiempoRepository.sumHorasPorUsuarioEnProyecto(proyectoId);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorUsuarioGlobalRango(LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorUsuarioGlobalRango(desde, hasta);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorUsuarioEnIteracionRango(Long iteracionId, LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorUsuarioEnIteracionRango(iteracionId, desde, hasta);
    }
    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorUsuarioEnProyectoRango(Long proyectoId, LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorUsuarioEnProyectoRango(proyectoId, desde, hasta);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorCategoriaGlobal() {
        return tiempoRepository.sumHorasPorCategoriaGlobal();
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorCategoriaEnIteracion(Long iteracionId) {
        return tiempoRepository.sumHorasPorCategoriaEnIteracion(iteracionId);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorCategoriaEnProyecto(Long proyectoId) {
        return tiempoRepository.sumHorasPorCategoriaEnProyecto(proyectoId);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorCategoriaGlobalRango(LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorCategoriaGlobalRango(desde, hasta);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorCategoriaEnIteracionRango(Long iteracionId, LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorCategoriaEnIteracionRango(iteracionId, desde, hasta);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorCategoriaEnProyectoRango(Long proyectoId, LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorCategoriaEnProyectoRango(proyectoId, desde, hasta);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorEtapa(Long proyectoId, Long etapaId, Long iteracionId, LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorEtapa(proyectoId, etapaId, iteracionId, desde, hasta);
    }

    @Transactional(readOnly = true)
    public java.util.List<Object[]> horasPorDiaYTarea(Long proyectoId, Long etapaId, Long iteracionId, LocalDate desde, LocalDate hasta) {
        return tiempoRepository.sumHorasPorDiaYTarea(proyectoId, etapaId, iteracionId, desde, hasta);
    }
}
