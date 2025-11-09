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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tarea")
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTarea;

    // 🔹 Relación con Iteracion
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idIteracion", nullable = false)
    private Iteracion iteracion;

    // 🔹 Relación con Usuario
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Tiempo> tiempos = new HashSet<>();

    @Column(length = 50)
    private String estado;

    @Column(columnDefinition = "TEXT")
    @Size(max=150)
    private String descripcion;

    @NotNull(message = "La fecha de creación es obligatoria")
    private LocalDate fechaCreacion;


    @Column(length = 50)
    private String prioridad;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @Column(length = 255)
    @Size(max=255)
    @NotBlank(message = "El nombre de la tarea es obligatorio")
    private String nombre;

    @Column(name = "horas_estimadas")
    private Double horasEstimadas;

    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
private Set<Comentario> comentarios = new HashSet<>();



    @ManyToMany
    @JoinTable(name = "tarea_categoria", joinColumns = @JoinColumn(name = "idTarea"), inverseJoinColumns = @JoinColumn(name = "idCategoria"))
    private Set<Categoria> categorias = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "dependencias_tareas", joinColumns = @JoinColumn(name = "id_tarea"), inverseJoinColumns = @JoinColumn(name = "id_tarea_dependencia"))
    private Set<Tarea> dependencias = new HashSet<>();

    @ManyToMany(mappedBy = "dependencias")
    private Set<Tarea> dependientes = new HashSet<>();

    // 🔹 Constructores
    public Tarea() {
    }

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

    public Set<Tarea> getDependencias() {
        return dependencias;
    }

    public void setDependencias(Set<Tarea> dependencias) {
        this.dependencias = dependencias;
    }

    public Set<Tarea> getDependientes() {
        return dependientes;
    }

    public void setDependientes(Set<Tarea> dependientes) {
        this.dependientes = dependientes;
    }
    
    public Long getIdTarea() {
        return idTarea;
    }

    public void setIdTarea(Long idTarea) {
        this.idTarea = idTarea;
    }

    public Iteracion getIteracion() {
        return iteracion;
    }

    public void setIteracion(Iteracion iteracion) {
        this.iteracion = iteracion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDate getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDate fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public String getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(String prioridad) {
        this.prioridad = prioridad;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Set<Categoria> getCategorias() {
        return categorias;
    }

    public void setCategorias(Set<Categoria> categorias) {
        this.categorias = categorias;
    }

    public Double getHorasEstimadas() {
        return horasEstimadas;
    }

    public void setHorasEstimadas(Double horasEstimadas) {
        this.horasEstimadas = horasEstimadas;
    }
}
