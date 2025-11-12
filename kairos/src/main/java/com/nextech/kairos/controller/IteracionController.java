package com.nextech.kairos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.nextech.kairos.dto.IteracionCreateDTO;
import com.nextech.kairos.dto.IteracionDTO;
import com.nextech.kairos.mapper.IteracionMapper;
import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.service.IEtapaService;
import com.nextech.kairos.service.IIteracionService;


@RestController
@RequestMapping("/api/iteraciones")
@CrossOrigin(origins = "http://localhost:4200")
public class IteracionController {

    @Autowired
    private IIteracionService iteracionService;

    @Autowired
    private IEtapaService etapaService;

    @GetMapping
    public List<IteracionDTO> listarIteraciones() {
        return iteracionService.listarIteraciones()
        .stream()
        .map(IteracionMapper::toDTO)
        .toList();
    }

    @GetMapping("/por-etapa/{idEtapa}")
    public List<IteracionDTO> listarPorEtapa(@PathVariable Long idEtapa) {
        return iteracionService.listarPorEtapa(idEtapa)
            .stream()
            .map(IteracionMapper::toDTO)
            .toList();
    }

    @GetMapping("/por-proyecto/{idProyecto}")
    public List<IteracionDTO> listarPorProyecto(@PathVariable Long idProyecto) {
        return iteracionService.listarPorProyecto(idProyecto)
            .stream()
            .map(IteracionMapper::toDTO)
            .toList();
    }

    @GetMapping("/{id}")
    public Iteracion obtener(@PathVariable Long id) {
        return iteracionService.obtenerPorId(id);
    }

    @PostMapping
    public IteracionDTO guardar(@RequestBody IteracionCreateDTO dto) {
        if (dto.getEtapaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta etapaId para asociar la iteración");
        }
        Etapa etapa = etapaService.obtener(dto.getEtapaId());
        if (etapa == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Etapa no encontrada con id: " + dto.getEtapaId());
        }
        Iteracion iter = new Iteracion();
        iter.setNumero(dto.getNumero());
        iter.setDescripcion(dto.getDescripcion());
        iter.setFechaInicio(dto.getFechaInicio() != null && !dto.getFechaInicio().isBlank() ? java.time.LocalDate.parse(dto.getFechaInicio()) : null);
        iter.setFechaFin(dto.getFechaFin() != null && !dto.getFechaFin().isBlank() ? java.time.LocalDate.parse(dto.getFechaFin()) : null);
        iter.setEtapa(etapa);
        Iteracion saved = iteracionService.guardarIteracion(iter);
        return IteracionMapper.toDTO(saved);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        iteracionService.eliminarIteracion(id);
    }
}
