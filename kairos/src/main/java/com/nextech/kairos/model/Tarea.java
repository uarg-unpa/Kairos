package com.nextech.kairos.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tarea")
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTarea;

    @NotBlank
    @Size(max = 255)
    @Column(name = "nombre", nullable = false, length = 255)
    private String nombre;

    @Size(max = 50)
    @Column(name = "estado", length = 50)
    private String estado;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

    @Size(max = 50)
    @Column(name = "prioridad", length = 50)
    private String prioridad;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idIteracion", nullable = false) 
    private Iteracion iteracion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = true) 
    private Usuario usuarioAsignado; 

    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comentario> comentarios = new HashSet<>();
    
    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Tiempo> tiempos = new HashSet<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "categoria_tarea",
        joinColumns = @JoinColumn(name = "idTarea"),
        inverseJoinColumns = @JoinColumn(name = "idCategoria")
    )
    private Set<Categoria> categorias = new HashSet<>();

    // tabla de dependencia entre tareas
    @ManyToMany
    @JoinTable(
        name = "dependencia_tarea",
        joinColumns = @JoinColumn(name = "idTarea"),
        inverseJoinColumns = @JoinColumn(name = "idTareaDepende")
    )
    private Set<Tarea> tareasDependencia = new HashSet<>();

    @ManyToMany(mappedBy = "tareasDependencia")
    private Set<Tarea> tareasDependientes = new HashSet<>();
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDate.now();
        }
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
    public Long getIdTarea() { return idTarea; }
    public void setIdTarea(Long idTarea) { this.idTarea = idTarea; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
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
    public Iteracion getIteracion() { return iteracion; }
    public void setIteracion(Iteracion iteracion) { this.iteracion = iteracion; }
    public Usuario getUsuarioAsignado() { return usuarioAsignado; }
    public void setUsuarioAsignado(Usuario usuarioAsignado) { this.usuarioAsignado = usuarioAsignado; }
    public Set<Comentario> getComentarios() { return comentarios; }
    public void setComentarios(Set<Comentario> comentarios) { this.comentarios = comentarios; }
    public Set<Tiempo> getTiempos() { return tiempos; }
    public void setTiempos(Set<Tiempo> tiempos) { this.tiempos = tiempos; }
    public Set<Categoria> getCategorias() { return categorias; }
    public void setCategorias(Set<Categoria> categorias) { this.categorias = categorias; }
    public Set<Tarea> getTareasDependencia() { return tareasDependencia; }
    public void setTareasDependencia(Set<Tarea> tareasDependencia) { this.tareasDependencia = tareasDependencia; }
    public Set<Tarea> getTareasDependientes() { return tareasDependientes; }
    public void setTareasDependientes(Set<Tarea> tareasDependientes) { this.tareasDependientes = tareasDependientes; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}