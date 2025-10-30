package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.model.UsuarioProyectoId;
import com.nextech.kairos.repository.UsuarioProyectoRepository;

@Service
public class UsuarioProyectoService implements IUsuarioProyectoService {

    @Autowired
    private UsuarioProyectoRepository repository;

    @Override
    public List<UsuarioProyecto> listarTodos() {
        return repository.findAll();
    }

    @Override
    public Optional<UsuarioProyecto> obtenerPorId(UsuarioProyectoId id) {
        return repository.findById(id);
    }

    @Override
    public UsuarioProyecto save(UsuarioProyecto usuarioProyecto) {
        return repository.save(usuarioProyecto);
    }

    @Override
    public void eliminar(UsuarioProyectoId id) {
        repository.deleteById(id);
    }

    @Override
    public List<UsuarioProyecto> listarPorUsuario(Long idUsuario) {
        return repository.findByUsuario_Id(idUsuario);
    }

    @Override
    public List<UsuarioProyecto> listarPorProyecto(Long idProyecto) {
        return repository.findByProyecto_IdProyecto(idProyecto);
    }
}
