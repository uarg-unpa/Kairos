package com.nextech.kairos.repository.specification;

import org.springframework.data.jpa.domain.Specification;

import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Usuario;

import jakarta.persistence.criteria.Join;

public class UsuarioSpecification {
    
    public static Specification<Usuario> hasEmail(String email) {
        return (root, query, criteriaBuilder) -> 
            email == null ? null : criteriaBuilder.equal(root.get("email"), email);
    }
    
    public static Specification<Usuario> hasNombreContaining(String nombre) {
        return (root, query, criteriaBuilder) -> 
            nombre == null ? null : criteriaBuilder.like(
                criteriaBuilder.lower(root.get("nombre")), 
                "%" + nombre.toLowerCase() + "%"
            );
    }
    
    public static Specification<Usuario> hasRole(String roleName) {
        return (root, query, criteriaBuilder) -> {
            if (roleName == null) return null;
            
            Join<Usuario, Rol> roleJoin = root.join("roles");
            return criteriaBuilder.equal(roleJoin.get("nombre"), roleName);
        };
    }
    
    public static Specification<Usuario> hasPermission(String permisoName) {
        return (root, query, criteriaBuilder) -> {
            if (permisoName == null) return null;
            
            Join<Usuario, Rol> roleJoin = root.join("roles");
            Join<Rol, Permiso> permisoJoin = roleJoin.join("permisos");
            return criteriaBuilder.equal(permisoJoin.get("nombre"), permisoName);
        };
    }
    
    public static Specification<Usuario> hasAnyRole(String... roleNames) {
        return (root, query, criteriaBuilder) -> {
            if (roleNames == null || roleNames.length == 0) return null;
            
            Join<Usuario, Rol> roleJoin = root.join("roles");
            return roleJoin.get("nombre").in((Object[]) roleNames);
        };
    }
}
