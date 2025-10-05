package com.nextech.kairos.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "rol")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // <-- CORREGIDO: De Long a Integer
    
    @Column(name = "nombre")
    private String nombre;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "rol_permiso", 
        joinColumns = @JoinColumn(name = "id_rol"), 
        inverseJoinColumns = @JoinColumn(name = "id_permiso")
    )
    private Set<Permiso> permisos;

    // Getters y Setters
    public Integer getId() { return id; } // <-- Usa Integer
    public void setId(Integer id) { this.id = id; } // <-- Usa Integer
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Set<Permiso> getPermisos() { return permisos; }
    public void setPermisos(Set<Permiso> permisos) { this.permisos = permisos; }

    /**
     * Lógica de verificación de permiso (similar a buscarPermisoPorId en PHP)
     */
    public boolean hasPermiso(String permisoNombre) {
        return this.permisos.stream()
            .anyMatch(p -> p.getNombre().equals(permisoNombre));
    }
}
