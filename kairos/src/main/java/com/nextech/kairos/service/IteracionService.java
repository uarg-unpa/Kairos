package com.nextech.kairos.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.repository.IteracionRepository;

@Service
public class IteracionService implements IIteracionService {

    @Autowired
    private IteracionRepository iteracionRepository;

    @Override
    public List<Iteracion> listarIteraciones() {
        return iteracionRepository.findAll();
    }

    @Override
    public Iteracion obtenerPorId(Long id) {
        return iteracionRepository.findById(id).orElse(null);
    }

    @Override
    public Iteracion guardarIteracion(Iteracion iteracion) {
        return iteracionRepository.save(iteracion);
    }

    @Override
    public void eliminarIteracion(Long id) {
        iteracionRepository.deleteById(id);
    }

    @Override
    public List<Iteracion> listarPorEtapa(Long idEtapa) {
        return iteracionRepository.findByEtapa_IdEtapa(idEtapa);
    }

    @Override
    public List<Iteracion> listarPorProyecto(Long idProyecto) {
        return iteracionRepository.findByEtapa_Proyecto_IdProyecto(idProyecto);
    }
}
