package com.nextech.kairos.dto;

import com.nextech.kairos.model.UsuarioProyecto;

public class UsuarioProyectoResponse {

    private Long idUsuario;
    private String nombre;
    private String email;
    private String rolProyecto;

    // Constructor desde entidad
    public UsuarioProyectoResponse(UsuarioProyecto up) {
        if (up != null && up.getUsuario() != null) {
            this.idUsuario = up.getUsuario().getId();
            this.nombre = up.getUsuario().getNombre();
            this.email = up.getUsuario().getEmail();
        }
        this.rolProyecto = up != null ? up.getRolProyecto() : null;
    }

    // Getters
    public Long getIdUsuario() {
        return idUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEmail() {
        return email;
    }

    public String getRolProyecto() {
        return rolProyecto;
    }

    // Setters (opcionales, si usas builders o mapeo)
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRolProyecto(String rolProyecto) {
        this.rolProyecto = rolProyecto;
    }
}