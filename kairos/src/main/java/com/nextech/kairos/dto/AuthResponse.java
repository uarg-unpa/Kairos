package com.nextech.kairos.dto;

public class AuthResponse {
    private String message;
    private String token;
    
    public AuthResponse(String message, String token) {
        this.message = message;
        this.token = token;
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
}
