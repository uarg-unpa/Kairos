
package com.nextech.kairos.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class UsuarioProyectoId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "idUsuario")
    private Long idUsuario;

    @Column(name = "idProyecto")
    private Long idProyecto;

    public UsuarioProyectoId() {}

    public UsuarioProyectoId(Long idUsuario, Long idProyecto) {
        this.idUsuario = idUsuario;
        this.idProyecto = idProyecto;
    }

    // --- Getters y Setters ---
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public Long getIdProyecto() { return idProyecto; }
    public void setIdProyecto(Long idProyecto) { this.idProyecto = idProyecto; }

    // Implementar equals y hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UsuarioProyectoId)) return false;
        UsuarioProyectoId that = (UsuarioProyectoId) o;
        return Objects.equals(getIdUsuario(), that.getIdUsuario()) &&
               Objects.equals(getIdProyecto(), that.getIdProyecto());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getIdUsuario(), getIdProyecto());
    }
}
