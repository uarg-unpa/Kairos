package com.nextech.kairos.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // <-- CORREGIDO: De Long a Integer
    
    @Column(name = "nombre")
    private String nombre;
    
    @Column(name = "email", unique = true)
    private String email;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "usuario_rol", 
        joinColumns = @JoinColumn(name = "id_usuario"), 
        inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private Set<Rol> roles;

    // Getters y Setters
    public Integer getId() { return id; } // <-- Usa Integer
    public void setId(Integer id) { this.id = id; } // <-- Usa Integer
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Set<Rol> getRoles() { return roles; }
    public void setRoles(Set<Rol> roles) { this.roles = roles; }

    /**
     * Lógica para buscar si el usuario tiene un Rol específico
     */
    public boolean hasRole(Integer roleId) { // <-- Usa Integer
        return this.roles.stream()
            .anyMatch(r -> r.getId().equals(roleId));
    }
    
    /**
     * Lógica para verificar un permiso a través de sus roles.
     */
    public boolean hasPermiso(String permisoNombre) {
        return this.roles.stream()
            .anyMatch(rol -> rol.hasPermiso(permisoNombre));
    }
}