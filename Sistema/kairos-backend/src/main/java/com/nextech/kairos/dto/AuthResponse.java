package com.nextech.kairos.dto;
import com.nextech.kairos.model.Usuario;

public class AuthResponse {
    private String message;
    private String token;
    private Usuario usuario;
    
    public AuthResponse(String message, String token, Usuario usuario) {
        this.message = message;
        this.token = token;
        this.usuario = usuario;
    }
    
    // Getters and Setters
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
}
