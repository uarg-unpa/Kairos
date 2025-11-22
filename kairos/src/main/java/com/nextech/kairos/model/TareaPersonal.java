package com.nextech.kairos.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "tarea_personal")
public class TareaPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    @Size(max = 50, message = "El nombre de la tarea no puede exceder los 50 caracteres")
    @NotBlank(message = "El nombre de la tarea es obligatorio")
    private String nombre;

    @Column(columnDefinition = "TEXT")
    @Size(max = 150)
    private String descripcion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @NotNull(message = "La fecha de creación es obligatoria")
    private LocalDate fechaCreacion;

    @Column(length = 20)
    private String estado;

    // Campos para la propuesta
    @Column(name = "proyecto_propuesto_id")
    private Long proyectoPropuestoId;

    @Column(name = "categoria_propuesta_id")
    private Long categoriaPropuestaId;

    public TareaPersonal() {
    }

    public TareaPersonal(Usuario usuario, String nombre, String descripcion, LocalDate fechaCreacion, String estado) {
        this.usuario = usuario;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDate getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDate fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getProyectoPropuestoId() {
        return proyectoPropuestoId;
    }

    public void setProyectoPropuestoId(Long proyectoPropuestoId) {
        this.proyectoPropuestoId = proyectoPropuestoId;
    }

    public Long getCategoriaPropuestaId() {
        return categoriaPropuestaId;
    }

    public void setCategoriaPropuestaId(Long categoriaPropuestaId) {
        this.categoriaPropuestaId = categoriaPropuestaId;
    }
}
