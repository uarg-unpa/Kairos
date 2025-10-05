package com.nextech.kairos.model;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;

@Entity
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Un rol puede tener muchos usuarios
    @OneToMany(mappedBy = "rol")
    private Set<Usuario> usuarios = new HashSet<>();
    
    private String nombre;
    @ManyToMany
    @JoinTable(
        name = "rol_permiso",
        joinColumns = @JoinColumn(name = "id_rol"),
        inverseJoinColumns = @JoinColumn(name = "id_permiso")
    )
    // Getters y Setters

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
