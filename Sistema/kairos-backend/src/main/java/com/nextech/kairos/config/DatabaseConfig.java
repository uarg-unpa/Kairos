package com.nextech.kairos.config;


import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.service.PermisoService;
import com.nextech.kairos.service.RolService;

@Configuration
public class DatabaseConfig {
    
    @Bean
    CommandLineRunner initDatabase(PermisoService permisoService, RolService rolService) {
        return args -> {
            // crear permisos si no existen
            createPermissionIfNotExists(permisoService, Constants.PERMISSION_USUARIOS);
            createPermissionIfNotExists(permisoService, Constants.PERMISSION_ROLES);
            createPermissionIfNotExists(permisoService, Constants.PERMISSION_PERMISOS);
            createPermissionIfNotExists(permisoService, Constants.PERMISSION_SALIR);
            createPermissionIfNotExists(permisoService, Constants.PERMISSION_INGRESAR);
            
            // crear roles si no existen
            createRoleIfNotExists(rolService, Constants.ROLE_ADMIN);
            createRoleIfNotExists(rolService, Constants.ROLE_USER);
            
            // asignar permisos al rol Admin
            assignPermissionsToAdminRole(rolService, permisoService);
            
            // asignar permisos al rol Usuario
            assignPermissionsToUserRole(rolService, permisoService);
        };
    }
    
    private void createPermissionIfNotExists(PermisoService permisoService, String permisoName) {
        if (permisoService.findByName(permisoName).isEmpty()) {
            permisoService.createPermission(permisoName);
            System.out.println("Created permission: " + permisoName);
        }
    }
    
    private void createRoleIfNotExists(RolService rolService, String roleName) {
        if (rolService.findByName(roleName).isEmpty()) {
            rolService.createRole(roleName);
            System.out.println("Created role: " + roleName);
        }
    }
    
    private void assignPermissionsToAdminRole(RolService rolService, PermisoService permisoService) {
        Rol adminRole = rolService.findByName(Constants.ROLE_ADMIN).orElse(null);
        if (adminRole != null) {
            // admin tiene todos los permisos
            String[] allPermissions = {
                Constants.PERMISSION_USUARIOS,
                Constants.PERMISSION_ROLES,
                Constants.PERMISSION_PERMISOS,
                Constants.PERMISSION_SALIR,
                Constants.PERMISSION_INGRESAR
            };
            
            for (String permissionName : allPermissions) {
                Permiso permiso = permisoService.findByName(permissionName).orElse(null);
                if (permiso != null && !rolService.hasPermission(adminRole.getId(), permissionName)) {
                    rolService.assignPermission(adminRole.getId(), permiso.getId());
                    System.out.println("Assigned permission " + permissionName + " to Admin role");
                }
            }
        }
    }
    
    private void assignPermissionsToUserRole(RolService rolService, PermisoService permisoService) {
        Rol userRole = rolService.findByName(Constants.ROLE_USER).orElse(null);
        if (userRole != null) {
            // usuario tiene permisos basicos
            String[] basicPermissions = {
                Constants.PERMISSION_SALIR,
                Constants.PERMISSION_INGRESAR
            };
            
            for (String permissionName : basicPermissions) {
                Permiso permiso = permisoService.findByName(permissionName).orElse(null);
                if (permiso != null && !rolService.hasPermission(userRole.getId(), permissionName)) {
                    rolService.assignPermission(userRole.getId(), permiso.getId());
                    System.out.println("Assigned permission " + permissionName + " to User role");
                }
            }
        }
    }
}
