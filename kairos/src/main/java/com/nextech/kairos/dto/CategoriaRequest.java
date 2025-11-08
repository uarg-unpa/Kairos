package com.nextech.kairos.dto;

import java.io.Serializable;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para crear/actualizar una categoría.
 */
public class CategoriaRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    // Opcional: usar para actualizaciones
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String descripcion;

    private Long idProyecto;


    public CategoriaRequest() {}

    public CategoriaRequest(Long id, String nombre, String descripcion, Long idProyecto) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.idProyecto = idProyecto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getIdProyecto(){
        return this.idProyecto;
    }

    public void setidProyecto(Long idProyecto){
        this.idProyecto = idProyecto;
    }


        @Override
    public String toString() {
        return "CategoriaRequest{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", descripcion='" + descripcion + '\'' +
                '}';
    }
}