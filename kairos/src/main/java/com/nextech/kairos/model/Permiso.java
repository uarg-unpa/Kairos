package com.nextech.kairos.model;
import jakarta.persistence.*;

@Entity
@Table(name = "permiso")
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // <-- CORREGIDO: De Long a Integer
    
    @Column(name = "nombre")
    private String nombre;

    // Getters y Setters
    public Integer getId() { return id; } // <-- Usa Integer
    public void setId(Integer id) { this.id = id; } // <-- Usa Integer
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}