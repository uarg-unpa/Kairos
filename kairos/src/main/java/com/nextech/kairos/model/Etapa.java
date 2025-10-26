package com.nextech.kairos.model;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "etapa")
public class Etapa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEtapa;

    @NotBlank
    @Size(max = 255)
    @Column(name = "nombre", nullable = false, length = 255)
    private String nombre;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProyecto", nullable = false) //FK
    private Proyecto proyecto;

    @OneToMany(mappedBy = "etapa", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Iteracion> iteraciones = new HashSet<>();

    public Long getIdEtapa() { return idEtapa; }
    public void setIdEtapa(Long idEtapa) { this.idEtapa = idEtapa; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
    public Proyecto getProyecto() { return proyecto; }
    public void setProyecto(Proyecto proyecto) { this.proyecto = proyecto; }
    public Set<Iteracion> getIteraciones() { return iteraciones; }
    public void setIteraciones(Set<Iteracion> iteraciones) { this.iteraciones = iteraciones; }
}