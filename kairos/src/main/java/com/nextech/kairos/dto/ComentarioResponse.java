package com.nextech.kairos.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public class ComentarioResponse {
   

    @NotNull(message = "El contenido no puede estar vacío")
    @Size(min = 1, max = 5000)
    private String contenido;

    @NotNull(message = "Se debe indicar la tarea")
    private Long idTarea;

    private Long idUsuario; // Opcional

    // Getters y setters
    public String getContenido() {
        return contenido;
    }
    public void setContenido(String contenido) {
        this.contenido = contenido;
    }
    public Long getIdTarea() {
        return idTarea;
    }
    public void setIdTarea(Long idTarea) {
        this.idTarea = idTarea;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
}

