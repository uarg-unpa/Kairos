package com.nextech.kairos.dto;

public class ComentarioRequest {
    private long idComentario;
    private String fechaComentario;
    private String contenido;  
    private long idTarea;
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
