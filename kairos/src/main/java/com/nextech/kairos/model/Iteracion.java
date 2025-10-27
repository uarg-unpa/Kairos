package com.nextech.kairos.model;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "iteracion")
public class Iteracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idIteracion;

    @Column(name = "numero")
    private Integer numero;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEtapa", nullable = false)
    @JsonIgnore
    private Etapa etapa;

    @OneToMany(mappedBy = "iteracion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private Set<Tarea> tareas = new HashSet<>();

    // 🔹 Getters y Setters
    public Long getIdIteracion() { return idIteracion; }
    public void setIdIteracion(Long idIteracion) { this.idIteracion = idIteracion; }

    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public Etapa getEtapa() { return etapa; }
    public void setEtapa(Etapa etapa) { this.etapa = etapa; }

    public Set<Tarea> getTareas() { return tareas; }
    public void setTareas(Set<Tarea> tareas) { this.tareas = tareas; }
}
