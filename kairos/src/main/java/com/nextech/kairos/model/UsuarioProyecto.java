package com.nextech.kairos.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "usuario_proyecto")
public class UsuarioProyecto {

    @EmbeddedId
    private UsuarioProyectoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUsuario")
    @JoinColumn(name = "idUsuario")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idProyecto")
    @JoinColumn(name = "idProyecto")
    private Proyecto proyecto;

    @Size(max = 100)
    @Column(name = "rol_proyecto", length = 100)
    private String rolProyecto;

    public UsuarioProyecto() {
        this.id = new UsuarioProyectoId();
    }

    public UsuarioProyecto(Usuario usuario, Proyecto proyecto, String rolProyecto) {
        this.usuario = usuario;
        this.proyecto = proyecto;
        this.rolProyecto = rolProyecto;
        this.id = new UsuarioProyectoId(usuario.getId(), proyecto.getIdProyecto());
    }

    public UsuarioProyectoId getId() { return id; }
    public void setId(UsuarioProyectoId id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Proyecto getProyecto() { return proyecto; }
    public void setProyecto(Proyecto proyecto) { this.proyecto = proyecto; }
    public String getRolProyecto() { return rolProyecto; }
    public void setRolProyecto(String rolProyecto) { this.rolProyecto = rolProyecto; }
}

@Embeddable
class UsuarioProyectoId implements Serializable {
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

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public Long getIdProyecto() { return idProyecto; }
    public void setIdProyecto(Long idProyecto) { this.idProyecto = idProyecto; }
}