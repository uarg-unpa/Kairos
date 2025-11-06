package com.nextech.kairos.dto;

public class CategoriaResponse {
    

    private Long idCategoria;
    private String nombre;
    private String descripcion;
    private Long idProyecto;

    // Constructor vacío
    public CategoriaResponse() {}

    // Constructor con parámetros
    public CategoriaResponse(Long idCategoria, String nombre, String descripcion, Long idProyecto) {
        this.idCategoria = idCategoria;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.idProyecto = idProyecto;
    }

    // Getters y Setters
    public Long getIdProyecto(){ 
        return idProyecto;
    }

    public void setIdProyecto(Long idProyecto){
        this.idProyecto = idProyecto;
    }


    public Long getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Long idCategoria) {
        this.idCategoria = idCategoria;
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

}


