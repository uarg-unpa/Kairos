package com.nextech.kairos.service;

import java.util.List;
import java.util.Optional;

import com.nextech.kairos.model.Usuario;

public interface IUsuarioService {

    List<Usuario> getAllUsuarios();
    List<Usuario> getAllUsuariosWithRoles();
    
    Optional<Usuario> getUsuarioById(Long id);
    Optional<Usuario> getUsuarioByIdWithRolesAndPermisos(Long id);
    Optional<Usuario> getUsuarioByEmail(String email);
    
    Usuario createUsuario(Usuario usuario);
    Usuario updateUsuario(Long id, Usuario usuario);
    
    void deleteUsuario(Long id);
    
    List<Usuario> searchByNombre(String nombre);
    List<Usuario> getUsuariosByRoleName(String roleName);
    List<Usuario> getUsuariosByPermisoName(String permisoName);
    
    long countByRoleName(String roleName);
}

