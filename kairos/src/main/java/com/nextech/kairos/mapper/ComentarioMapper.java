package com.nextech.kairos.mapper;
import com.nextech.kairos.model.Comentario;
import com.nextech.kairos.dto.ComentarioRequest;
import com.nextech.kairos.dto.ComentarioResponse;


public class ComentarioMapper {
    //transformar una categoria a categoriaDTO

    public static ComentarioRequest toDTO(Comentario comentario) {
        if (comentario == null) return null;
        ComentarioRequest dto = new ComentarioRequest();
        dto.setIdComentario(comentario.getIdComentario());
        dto.setFechaComentario(comentario.getFechaComentario().toString());
        dto.setContenido(comentario.getContenido());
        dto.setIdTarea(comentario.getTarea().getIdTarea());
        if (comentario.getUsuario() != null) {
            dto.setIdUsuario(comentario.getUsuario().getId());
        } else {
            dto.setIdUsuario(null);
        }
        return dto;
    }

    public static Comentario createDTO (ComentarioResponse comentarioResponse) {
        if (comentarioResponse == null) return null;
        Comentario comentario = new Comentario();
        comentario.setContenido(comentarioResponse.getContenido());
        // La asignación de tarea y usuario se debe manejar en el servicio
        return comentario;
    }
}
