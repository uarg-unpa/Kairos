package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;

import com.nextech.kairos.model.Comentario;

public interface IComentarioService {

    List<Comentario> findAll();

    Optional<Comentario> findById(Long idComentario);

    Comentario createComentario(Comentario comentario, Long idTarea, Long idUsuario);

    void delete(Long idComentario);

    List<Comentario> findComentariosByTarea(Long idTarea);

    List<Comentario> findComentariosByUsuario(Long idUsuario);

    List<Comentario> findComentariosByTareaOrderedByDate(Long idTarea);
}