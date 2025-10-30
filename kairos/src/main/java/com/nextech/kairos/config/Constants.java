package com.nextech.kairos.config;

public class Constants {
    
    // Roles
    public static final String ROLE_ADMIN = "Administrador";
    public static final String ROLE_USER = "Usuario Común";
    
    // Permissions
    public static final String PERMISSION_USUARIOS = "Usuarios";
    public static final String PERMISSION_ROLES = "Roles";
    public static final String PERMISSION_PERMISOS = "Permisos";
    public static final String PERMISSION_SALIR = "Salir";
    public static final String PERMISSION_INGRESAR = "Ingresar";
    
    // API Endpoints
    public static final String API_BASE = "/api";
    public static final String AUTH_BASE = "/auth";
    
    // JWT
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";
    
    private Constants() {
        // Utility class
    }
}
