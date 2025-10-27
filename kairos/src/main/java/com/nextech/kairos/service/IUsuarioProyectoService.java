package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;

import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.model.UsuarioProyectoId;

public interface IUsuarioProyectoService {


    
    // Guardar o actualizar un registro
    UsuarioProyecto save(UsuarioProyecto usuarioProyecto);

    // Obtener todos los registros
    List<UsuarioProyecto> listarTodos();

    // Obtener un registro por clave compuesta
    Optional<UsuarioProyecto> obtenerPorId(UsuarioProyectoId id);

    // Obtener todos los proyectos de un usuario
    List<UsuarioProyecto> listarPorUsuario(Long idUsuario);

    // Obtener todos los usuarios de un proyecto
    List<UsuarioProyecto> listarPorProyecto(Long idProyecto);

    // Eliminar un registro por clave compuesta
    void eliminar(UsuarioProyectoId id);

}


