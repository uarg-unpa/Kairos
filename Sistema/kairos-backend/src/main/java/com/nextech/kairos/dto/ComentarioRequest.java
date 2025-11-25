package com.nextech.kairos.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ComentarioRequest {
    @NotBlank(message = "El contenido del comentario es obligatorio")
    private long idComentario;
    private String fechaComentario;

    @Size(max = 90, message = "El contenido no puede exceder 90 caracteres")
    private String contenido;  

    @NotBlank(message = "El ID de la tarea es obligatorio")
    private long idTarea;

    @NotBlank(message = "El ID del usuario es obligatorio")
    private Long idUsuario;
    // Getters and Setters

    public long getIdComentario() {
        return idComentario;
    }
    public void setIdComentario(long idComentario) {
        this.idComentario = idComentario;
    }
    public String getFechaComentario() {
        return fechaComentario;
    }
    public void setFechaComentario(String fechaComentario) {
        this.fechaComentario = fechaComentario;
    }
   
    public String getContenido() {
        return contenido;
    }
    public void setContenido(String contenido) {
        this.contenido = contenido;
    }
    public long getIdTarea() {
        return idTarea;
    }
    public void setIdTarea(long idTarea) {
        this.idTarea = idTarea;
    }
    public Long getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    
}
