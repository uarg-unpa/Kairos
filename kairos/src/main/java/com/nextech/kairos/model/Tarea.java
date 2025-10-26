package com.nextech.kairos.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import jakarta.persistence.*;

@Entity
@Table(name = "Tarea")
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTarea;

    private Integer idIteracion;
    private Integer idUsuario;

    @Column(length = 50)
    private String estado;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private LocalDate fechaCreacion;

    @Column(length = 50)
    private String prioridad;

    private LocalDate fechaFin;

    @Column(length = 255)
    private String nombre;

    // 🔹 Constructores
    public Tarea() {}

    public Tarea(Integer idIteracion, Integer idUsuario, String estado, String descripcion,
                 LocalDate fechaCreacion, String prioridad, LocalDate fechaFin, String nombre) {
        this.idIteracion = idIteracion;
        this.idUsuario = idUsuario;
        this.estado = estado;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
        this.prioridad = prioridad;
        this.fechaFin = fechaFin;
        this.nombre = nombre;
    }

    // 🔹 Getters y Setters
    public Integer getIdTarea() { return idTarea; }
    public void setIdTarea(Integer idTarea) { this.idTarea = idTarea; }

    public Integer getIdIteracion() { return idIteracion; }
    public void setIdIteracion(Integer idIteracion) { this.idIteracion = idIteracion; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDate fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}