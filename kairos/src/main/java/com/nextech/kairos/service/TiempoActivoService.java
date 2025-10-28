package com.nextech.kairos.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Tiempo;
import com.nextech.kairos.model.TiempoActivo;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.TiempoActivoRepository;

@Service
@Transactional
public class TiempoActivoService {

    private final TiempoActivoRepository tiempoActivoRepository;
    private final TareaService tareaService;
    private final TiempoService tiempoService;

    public TiempoActivoService(
        TiempoActivoRepository tiempoActivoRepository,
        TareaService tareaService,
        TiempoService tiempoService
    ) {
        this.tiempoActivoRepository = tiempoActivoRepository;
        this.tareaService = tareaService;
        this.tiempoService = tiempoService;
    }

    /**
     * Obtiene el cronómetro activo para un usuario, si existe.
     * Marcado como readOnly porque solo realiza una consulta.
     */
    @Transactional(readOnly = true)
    public Optional<TiempoActivo> getActiveForUser(Long idUsuario) {
        return tiempoActivoRepository.findByUsuarioId(idUsuario);
    }
    /**

    Inicia un nuevo cronómetro para el usuario y tarea indicados.
    Lanza IllegalStateException si ya existe un cronómetro activo para el usuario.
    */
    public TiempoActivo start(Long idUsuario, Long idTarea, Usuario usuario) {
        Optional<TiempoActivo> existing = tiempoActivoRepository.findByUsuarioId(idUsuario);
        if (existing.isPresent()) {
            throw new IllegalStateException("Ya existe un cronómetro activo para este usuario. Detenlo antes de iniciar otro.");
        }

        Tarea tarea = tareaService.findById(idTarea)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + idTarea));

        TiempoActivo ta = new TiempoActivo();
        ta.setUsuario(usuario);
        ta.setTarea(tarea);
        ta.setInicio(LocalDateTime.now());
        return tiempoActivoRepository.save(ta);
    }
    /**

    Detiene el cronómetro activo del usuario y persiste el tiempo trabajado.
    Si providedSeconds es nulo/≤0, calcula la duración desde el inicio hasta ahora.
    */
    public Tiempo stop(Long idUsuario, Integer providedSeconds) {
        TiempoActivo activo = tiempoActivoRepository.findByUsuarioId(idUsuario)
            .orElseThrow(() -> new IllegalStateException("No hay cronómetro activo para este usuario."));

        long seconds;
        if (providedSeconds != null && providedSeconds > 0) {
            seconds = providedSeconds.longValue();
        } else {
            seconds = Duration.between(activo.getInicio(), LocalDateTime.now()).getSeconds();
        }

        Tiempo nuevoTiempo = new Tiempo();
        Tiempo registrado = tiempoService.registerTime(
            nuevoTiempo,
            activo.getTarea().getIdTarea(),
            activo.getUsuario().getId(),
            (int) seconds,
            LocalDate.now(),
            null
        );

        tiempoActivoRepository.delete(activo);
        return registrado;
    }
}
