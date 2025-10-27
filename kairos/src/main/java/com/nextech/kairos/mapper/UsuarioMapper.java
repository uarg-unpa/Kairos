package com.nextech.kairos.dto;

import com.nextech.kairos.model.Usuario;
import java.util.stream.Collectors;

public class UsuarioMapper {

    public static UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setFechaCreacion(usuario.getfechaCreacion());
        dto.setFechaActualizacion(usuario.getfechaActualizacion());

        if (usuario.getRoles() != null) {
            dto.setRoles(usuario.getRoles()
                .stream()
                .map(rol -> rol.getNombre()) // suponiendo que Rol tiene un campo "nombre"
                .collect(Collectors.toSet()));
        }

        return dto;
    }
}

