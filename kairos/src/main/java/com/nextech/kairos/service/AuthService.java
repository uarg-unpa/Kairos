// package com.nextech.kairos.service;
package com.nextech.kairos.service;

import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.RolRepositorio;
import com.nextech.kairos.repository.UsuarioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional; // Necesario

@Service
public class AuthService {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private RolRepositorio rolRepositorio;

    public Usuario loginOrCreateUsuario(String nombre, String email) {
        
        // 1. Usar findByEmail que devuelve Optional<Usuario> (si lo definiste así)
        Optional<Usuario> usuarioOptional = usuarioRepositorio.findByEmail(email);
        
        // 2. Usar orElseGet para crear un nuevo usuario si no existe
        Usuario usuario = usuarioOptional.orElseGet(() -> {
            
            // Si el usuario no existe, creamos uno nuevo
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(nombre);
            nuevoUsuario.setEmail(email);

            // Asignar rol por defecto "Usuario"
            
            // Es más seguro buscar el Rol de esta forma (y más idiomático)
            Optional<Rol> rolUsuarioOptional = rolRepositorio.findByNombre("Usuario");
            
            Rol rolUsuario = rolUsuarioOptional.orElseGet(() -> {
                 // Si el rol "Usuario" no existe, lo creamos.
                 Rol nuevoRol = new Rol();
                 nuevoRol.setNombre("Usuario");
                 // Se necesita el save aquí para que el rol exista antes de asignarlo
                 return rolRepositorio.save(nuevoRol); 
            });

            // Asignar el rol al nuevo usuario
            HashSet<Rol> roles = new HashSet<>();
            roles.add(rolUsuario);
            nuevoUsuario.setRoles(roles);

            // Guardar y devolver el nuevo usuario
            return usuarioRepositorio.save(nuevoUsuario);
        });

        return usuario;
    }
}