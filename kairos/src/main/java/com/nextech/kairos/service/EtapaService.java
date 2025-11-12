package com.nextech.kairos.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.repository.EtapaRepository;

@Service
public class EtapaService implements IEtapaService {
    private final EtapaRepository repo;
    public EtapaService(EtapaRepository repo) { this.repo = repo; }

    @Override
    public List<Etapa> listar() { return repo.findAll(); }

    @Override
    public List<Etapa> listarPorProyecto(Long idProyecto) { return repo.findByProyecto_IdProyecto(idProyecto); }

    @Override
    public Etapa obtener(Long id) { return repo.findById(id).orElse(null); }

    @Override
    public Etapa guardar(Etapa etapa) { return repo.save(etapa); }

    @Override
    public void eliminar(Long id) { repo.deleteById(id); }
}
