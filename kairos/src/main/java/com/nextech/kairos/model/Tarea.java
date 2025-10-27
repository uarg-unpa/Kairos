package com.nextech.kairos.model;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@Entity
@Table(name = "Tarea")
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTarea;

    // 🔹 Relación con Iteracion
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idIteracion", nullable = false)
    private Iteracion iteracion;

    // 🔹 Relación con Usuario
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @Column(length = 50)
    private String estado;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private LocalDate fechaCreacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDate.now();
    }

    @Column(length = 50)
    private String prioridad;

    private LocalDate fechaFin;

    @Column(length = 255)
    private String nombre;

    @Column(name = "horas_estimadas")
private Double horasEstimadas;

    @ManyToMany
    @JoinTable(
        name = "tarea_categoria",
        joinColumns = @JoinColumn(name = "idTarea"),
        inverseJoinColumns = @JoinColumn(name = "idCategoria")
    )
    @JsonManagedReference
    private Set<Categoria> categorias = new HashSet<>();

    // 🔹 Constructores
    public Tarea() {}

   public Tarea(Iteracion iteracion, Usuario usuario, String estado, String descripcion,
             LocalDate fechaCreacion, String prioridad, LocalDate fechaFin, String nombre,
             Double horasEstimadas) {
    this.iteracion = iteracion;
    this.usuario = usuario;
    this.estado = estado;
    this.descripcion = descripcion;
    this.fechaCreacion = fechaCreacion;
    this.prioridad = prioridad;
    this.fechaFin = fechaFin;
    this.nombre = nombre;
    this.horasEstimadas = horasEstimadas;
}

    // 🔹 Getters y Setters
    public Integer getIdTarea() { return idTarea; }
    public void setIdTarea(Integer idTarea) { this.idTarea = idTarea; }

    public Iteracion getIteracion() { return iteracion; }
    public void setIteracion(Iteracion iteracion) { this.iteracion = iteracion; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

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

    public Set<Categoria> getCategorias() { return categorias; }
    public void setCategorias(Set<Categoria> categorias) { this.categorias = categorias; }

    public Double getHorasEstimadas() { return horasEstimadas; }
public void setHorasEstimadas(Double horasEstimadas) { this.horasEstimadas = horasEstimadas; }
}
