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

import java.time.LocalDate;

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
        return etapaService.listar().stream().map(EtapaMapper::toDTO).toList();
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
        if (dto.getFechaInicio() != null && !dto.getFechaInicio().isBlank()) {
            e.setFechaInicio(LocalDate.parse(dto.getFechaInicio()));
        }
        if (dto.getFechaFin() != null && !dto.getFechaFin().isBlank()) {
            e.setFechaFin(LocalDate.parse(dto.getFechaFin()));
        }
        // Asociar a un proyecto existente por defecto (primero encontrado)
        Proyecto proyecto = proyectoRepository.findAll().stream().findFirst().orElse(null);
        if (proyecto != null) {
            e.setProyecto(proyecto);
        }
        Etapa saved = etapaService.guardar(e);
        return EtapaMapper.toDTO(saved);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        etapaService.eliminar(id);
    }

}
