package com.nextech.kairos.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class UsuarioProyectoId implements Serializable {

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "id_proyecto")
    private Long idProyecto;

    // Constructores
    public UsuarioProyectoId() {}

    public UsuarioProyectoId(Long idUsuario, Long idProyecto) {
        this.idUsuario = idUsuario;
        this.idProyecto = idProyecto;
    }

    // Getters y Setters
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public Long getIdProyecto() { return idProyecto; }
    public void setIdProyecto(Long idProyecto) { this.idProyecto = idProyecto; }

    // equals y hashCode (necesarios para IDs embebidos)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UsuarioProyectoId)) return false;
        UsuarioProyectoId that = (UsuarioProyectoId) o;
        return Objects.equals(idUsuario, that.idUsuario) &&
               Objects.equals(idProyecto, that.idProyecto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idUsuario, idProyecto);
    }
}
