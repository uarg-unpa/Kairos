package com.nextech.kairos.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.persistence.*;
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
