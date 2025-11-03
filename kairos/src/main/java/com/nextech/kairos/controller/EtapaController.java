package com.nextech.kairos.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.EtapaDTO;
import com.nextech.kairos.dto.IteracionDTO;
import com.nextech.kairos.mapper.EtapaMapper;
import com.nextech.kairos.mapper.IteracionMapper;
import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.service.EtapaService;

@RestController
@RequestMapping("/api/etapas")
@CrossOrigin(origins = "*")
public class EtapaController {

    @Autowired
    private EtapaService etapaService;

    @GetMapping
    public List<EtapaDTO> listar(@RequestParam(value = "proyectoId", required = false) Long proyectoId) {
        List<Etapa> etapas = (proyectoId != null)
                ? etapaService.listarPorProyecto(proyectoId)
                : etapaService.listarEtapas();
        return etapas.stream().map(EtapaMapper::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public EtapaDTO obtener(@PathVariable Long id) {
        return EtapaMapper.toDTO(etapaService.obtenerPorId(id));
    }

    @PostMapping("/proyecto/{proyectoId}")
    public EtapaDTO crearEtapa(@PathVariable Long proyectoId, @RequestBody Etapa etapa) {
        Etapa creada = etapaService.crearEtapaEnProyecto(proyectoId, etapa);
        return EtapaMapper.toDTO(creada);
    }

    @GetMapping("/{etapaId}/iteraciones")
    public List<IteracionDTO> listarIteraciones(@PathVariable Long etapaId) {
        return etapaService.listarIteracionesPorEtapa(etapaId)
                .stream().map(IteracionMapper::toDTO).collect(Collectors.toList());
    }

    @PostMapping("/{etapaId}/iteraciones")
    public IteracionDTO crearIteracion(@PathVariable Long etapaId, @RequestBody Iteracion iteracion) {
        Iteracion creada = etapaService.crearIteracionEnEtapa(etapaId, iteracion);
        return IteracionMapper.toDTO(creada);
    }
}

