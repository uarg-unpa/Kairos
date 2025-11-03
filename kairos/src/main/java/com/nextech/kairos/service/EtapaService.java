package com.nextech.kairos.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.repository.EtapaRepository;
import com.nextech.kairos.repository.IteracionRepository;
import com.nextech.kairos.repository.ProyectoRepository;

@Service
public class EtapaService implements IEtapaService {

    @Autowired
    private EtapaRepository etapaRepository;

    @Autowired
    private IteracionRepository iteracionRepository;

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Override
    public List<Etapa> listarEtapas() {
        return etapaRepository.findAll();
    }

    @Override
    public List<Etapa> listarPorProyecto(Long idProyecto) {
        if (idProyecto == null) return new ArrayList<>();
        return etapaRepository.findByProyecto_IdProyecto(idProyecto);
    }

    @Override
    public Etapa obtenerPorId(Long id) {
        return etapaRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Etapa guardar(Etapa etapa) {
        return etapaRepository.save(etapa);
    }

    @Override
    public void eliminar(Long id) {
        etapaRepository.deleteById(id);
    }

    @Override
    public List<Iteracion> listarIteracionesPorEtapa(Long idEtapa) {
        return iteracionRepository.findByEtapa_IdEtapa(idEtapa);
    }

    @Transactional
    public Etapa crearEtapaEnProyecto(Long idProyecto, Etapa etapa) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto).orElse(null);
        if (proyecto == null) return null;
        proyecto.crearEtapa(etapa);
        return etapaRepository.save(etapa);
    }

    @Transactional
    public Iteracion crearIteracionEnEtapa(Long idEtapa, Iteracion iteracion) {
        Etapa etapa = etapaRepository.findById(idEtapa).orElse(null);
        if (etapa == null) return null;
        etapa.crearIteracion(iteracion);
        return iteracionRepository.save(iteracion);
    }
}

