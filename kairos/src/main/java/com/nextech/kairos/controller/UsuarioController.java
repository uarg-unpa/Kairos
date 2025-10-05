package com.nextech.kairos.controller;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nextech.kairos.dto.UsuarioRequest;
import com.nextech.kairos.dto.UsuarioResponse;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAuthority('PERMISSION_USUARIOS')")
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> getAllUsers() {
        List<Usuario> usuarios = usuarioService.findAllWithRoles();
        List<UsuarioResponse> response = usuarios.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> getUserById(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.findById(id);
        
        if (usuario.isPresent()) {
            return ResponseEntity.ok(convertToResponse(usuario.get()));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<UsuarioResponse>> searchUsers(@RequestParam String nombre) {
        List<Usuario> usuarios = usuarioService.searchByName(nombre);
        List<UsuarioResponse> response = usuarios.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<UsuarioResponse> createUser(@Valid @RequestBody UsuarioRequest request) {
        Usuario usuario = new Usuario(request.getNombre(), request.getEmail());
        Usuario savedUsuario = usuarioService.save(usuario);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToResponse(savedUsuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> updateUser(@PathVariable Long id, 
                                                     @Valid @RequestBody UsuarioRequest request) {
        Optional<Usuario> existingUsuario = usuarioService.findById(id);
        
        if (existingUsuario.isPresent()) {
            Usuario usuario = existingUsuario.get();
            usuario.setNombre(request.getNombre());
            usuario.setEmail(request.getEmail());
            
            Usuario updatedUsuario = usuarioService.save(usuario);
            return ResponseEntity.ok(convertToResponse(updatedUsuario));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.findById(id);
        
        if (usuario.isPresent()) {
            usuarioService.delete(id);
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/{usuarioId}/roles/{rolId}")
    public ResponseEntity<UsuarioResponse> assignRole(@PathVariable Long usuarioId, 
                                                     @PathVariable Long rolId) {
        try {
            Usuario usuario = usuarioService.assignRole(usuarioId, rolId);
            return ResponseEntity.ok(convertToResponse(usuario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{usuarioId}/roles/{rolId}")
    public ResponseEntity<UsuarioResponse> removeRole(@PathVariable Long usuarioId, 
                                                     @PathVariable Long rolId) {
        try {
            Usuario usuario = usuarioService.removeRole(usuarioId, rolId);
            return ResponseEntity.ok(convertToResponse(usuario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}/permissions")
    public ResponseEntity<Set<String>> getUserPermissions(@PathVariable Long id) {
        Set<String> permissions = usuarioService.getUserPermissions(id);
        return ResponseEntity.ok(permissions);
    }
    
    private UsuarioResponse convertToResponse(Usuario usuario) {
        Set<String> roleNames = usuario.getRoles().stream()
                .map(rol -> rol.getNombre())
                .collect(Collectors.toSet());
        
        Set<String> permissions = usuarioService.getUserPermissions(usuario.getId());
        
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getEmail(),
            roleNames,
            permissions,
            usuario.getfechaCreacion(),
            usuario.getfechaActualizacion()
        );
    }
}
