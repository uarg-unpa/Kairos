package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.nextech.kairos.dto.EtapaDTO;
import com.nextech.kairos.mapper.EtapaMapper;
import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.service.IEtapaService;
import com.nextech.kairos.repository.ProyectoRepository;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.EstadoEtapa;
import java.util.stream.Collectors;

import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/etapas")
@CrossOrigin(origins = "http://localhost:4200")
public class EtapaController {
    private final IEtapaService etapaService;
    private final ProyectoRepository proyectoRepository;

    public EtapaController(IEtapaService etapaService, ProyectoRepository proyectoRepository) {
        this.etapaService = etapaService;
        this.proyectoRepository = proyectoRepository;
    }

    @GetMapping
    public List<EtapaDTO> listar() {
        List<Etapa> etapas = etapaService.listar();

        etapas.forEach(e -> {
            if (e.getProyecto() != null)
                e.getProyecto().getIdProyecto(); // fuerza la carga del proxy
        });

        return etapas.stream()
                .map(EtapaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/por-proyecto/{idProyecto}")
    public List<EtapaDTO> listarPorProyecto(@PathVariable Long idProyecto) {
        return etapaService.listarPorProyecto(idProyecto).stream().map(EtapaMapper::toDTO).toList();
    }

   @GetMapping("/proyecto/{idProyecto}/actual")
public ResponseEntity<EtapaDTO> obtenerEtapaActualPorProyecto(@PathVariable Long idProyecto) {
    Etapa etapa = etapaService.obtenerEtapaActualPorProyecto(idProyecto);
    if (etapa == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(EtapaMapper.toDTO(etapa));
}


    @GetMapping("/{id}")
    public EtapaDTO obtener(@PathVariable Long id) {
        Etapa e = etapaService.obtener(id);
        return EtapaMapper.toDTO(e);
    }

    @PostMapping
    public EtapaDTO crear(@RequestBody EtapaDTO dto) {
        Etapa e = new Etapa();
        e.setNombre(dto.getNombre());
        e.setDescripcion(dto.getDescripcion());
        e.setEstado(EstadoEtapa.PENDIENTE);
        LocalDate ini = (dto.getFechaInicio() != null && !dto.getFechaInicio().isBlank())
                ? LocalDate.parse(dto.getFechaInicio())
                : null;
        LocalDate fin = (dto.getFechaFin() != null && !dto.getFechaFin().isBlank()) ? LocalDate.parse(dto.getFechaFin())
                : null;
        if (ini != null && fin != null && fin.isBefore(ini)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        e.setFechaInicio(ini);
        e.setFechaFin(fin);
        // Asociar a proyecto indicado o fallback
        Proyecto proyecto = null;
        if (dto.getProyectoId() != null) {
            proyecto = proyectoRepository.findById(dto.getProyectoId()).orElse(null);
            if (proyecto == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Proyecto no encontrado con id: " + dto.getProyectoId());
            }
        } else {
            proyecto = proyectoRepository.findAll().stream().findFirst().orElse(null);
        }
        if (proyecto != null) {
            e.setProyecto(proyecto);
        }
        Etapa saved = etapaService.guardar(e);
        return EtapaMapper.toDTO(saved);
    }

    // Duplicate method removed; use the existing endpoint GET
    // /api/etapas/por-proyecto/{idProyecto}

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        etapaService.eliminar(id);
    }

    

}
