package com.nextech.kairos.dto;

import java.util.Set;

public class UserInfoResponse {
    private Long id;
    private String nombre;
    private String email;
    private Set<String> permissions;
    private boolean isAdmin;
    
    public UserInfoResponse(Long id, String nombre, String email, Set<String> permissions, boolean isAdmin) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.permissions = permissions;
        this.isAdmin = isAdmin;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Set<String> getPermissions() {
        return permissions;
    }
    
    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions;
    }
    
    public boolean isAdmin() {
        return isAdmin;
    }
    
    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }
}
