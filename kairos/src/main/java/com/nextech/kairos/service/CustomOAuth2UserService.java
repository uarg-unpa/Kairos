// service/CustomOAuth2UserService.java
package com.nextech.kairos.service;

import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.RolRepositorio; // NUEVO: para asignar roles por defecto
import com.nextech.kairos.repository.UsuarioRepositorio;
import com.nextech.kairos.oauth.CustomUserDetails; // NUEVO: clase adaptadora (ver más abajo)
import com.nextech.kairos.model.Rol;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService; // Importación necesaria
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service; // DEBE SER UN SERVICIO

import java.util.HashSet;
import java.util.Set;

@Service // Asegúrate de que Spring la detecte
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Autowired
    private UsuarioRepositorio usuarioRepository;
    
    @Autowired
    private RolRepositorio rolRepositorio; // NECESITAS INYECTAR EL REPOSITORIO DE ROLES

    // Instancia correcta del servicio de carga por defecto
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService(); 

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        
        // 1. Carga la información de Google usando el delegado
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        // 2. Busca o crea el usuario
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseGet(() -> {
                // Si el usuario no existe, creamos uno nuevo
                Usuario nuevoUsuario = new Usuario();
                nuevoUsuario.setEmail(email);
                nuevoUsuario.setNombre(name);

                // **ASIGNACIÓN DE ROLES POR DEFECTO (Lógica migrada del PHP)**
                // Asume que el Rol de Usuario Básico tiene ID = 2. Ajusta esto según tu BD.
                rolRepositorio.findById(2).ifPresent(rol -> {
                    Set<Rol> roles = new HashSet<>();
                    roles.add(rol);
                    nuevoUsuario.setRoles(roles);
                });
                
                return usuarioRepository.save(nuevoUsuario);
            });
        
        // 3. ADAPTACIÓN: En lugar de devolver el OAuth2User original, 
        //    lo envolvemos en una clase adaptadora (CustomUserDetails) que inyecta
        //    los Roles/Permisos de tu BD de la tabla 'usuario_rol'.
        return new CustomUserDetails(usuario, oauth2User.getAttributes());
    }
}