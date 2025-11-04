package com.nextech.kairos.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import com.nextech.kairos.config.Constants;
import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.RolRepository;
import com.nextech.kairos.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;






@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    @Captor
    private ArgumentCaptor<Usuario> usuarioCaptor;

    @BeforeEach
    void setup() {
        // default behavior: save returns the passed entity
        lenient().when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void createUserFromGoogle_whenUserExists_returnsExistingAndDoesNotSave() {
        String email = "exist@example.com";
        Usuario existing = new Usuario("Existing", email);

        lenient().when(usuarioRepository.findByEmail(email)).thenReturn(Optional.of(existing));

        Usuario result = usuarioService.createUserFromGoogle("Ignored", email);

        assertSame(existing, result);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void createUserFromGoogle_whenNoUser_createsWithDefaultRole() {
        String email = "new@example.com";
        String name = "New User";
        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.empty());

        Rol defaultRole = new Rol();
        // set role name if setter exists; service only needs the role instance
        when(rolRepository.findByNombre(Constants.ROLE_USER)).thenReturn(Optional.of(defaultRole));

        Usuario result = usuarioService.createUserFromGoogle(name, email);

        assertNotNull(result);
        assertEquals(name, result.getNombre());
        assertEquals(email, result.getEmail());
        assertFalse(result.getRoles().isEmpty());
        // role instance added should be the same one returned by repository
        assertTrue(result.getRoles().contains(defaultRole));
        verify(usuarioRepository).save(result);
    }

    @Test
    void assignRole_successAddsRoleAndSaves() {
        Long userId = 1L;
        Long roleId = 2L;
        Usuario usuario = new Usuario("U", "u@example.com");
        Rol rol = new Rol();

        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(roleId)).thenReturn(Optional.of(rol));

        Usuario updated = usuarioService.assignRole(userId, roleId);

        assertTrue(updated.getRoles().contains(rol));
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void assignRole_missingThrows() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        when(rolRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> usuarioService.assignRole(1L, 2L));
    }

    @Test
    void removeRole_successRemovesRoleAndSaves() {
        Long userId = 1L;
        Long roleId = 2L;
        Usuario usuario = new Usuario("U", "u@example.com");
        Rol rol = new Rol();
        usuario.addRol(rol);

        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(roleId)).thenReturn(Optional.of(rol));

        Usuario updated = usuarioService.removeRole(userId, roleId);

        assertFalse(updated.getRoles().contains(rol));
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void removeRole_missingThrows() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        when(rolRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> usuarioService.removeRole(1L, 2L));
    }

    @Test
    void getUserPermissions_returnsCollectedPermissionNames() {
        Long userId = 1L;
        Usuario usuario = new Usuario("U", "u@example.com");

        Permiso p1 = new Permiso();
        p1.setNombre("READ");
        Permiso p2 = new Permiso();
        p2.setNombre("WRITE");

        Rol r1 = new Rol();
        r1.setPermisos(new HashSet<>(Set.of(p1)));
        Rol r2 = new Rol();
        r2.setPermisos(new HashSet<>(Set.of(p2)));

        usuario.addRol(r1);
        usuario.addRol(r2);

        when(usuarioRepository.findByIdWithRolesAndPermisos(userId)).thenReturn(Optional.of(usuario));

        Set<String> permissions = usuarioService.getUserPermissions(userId);
        assertTrue(permissions.contains("READ"));
        assertTrue(permissions.contains("WRITE"));
    }

    @Test
    void hasPermission_and_hasRole_and_isAdmin_behavior() {
        Long userId = 1L;
        Usuario usuario = new Usuario("U", "u@example.com");

        Rol admin = new Rol();
        admin.setNombre(Constants.ROLE_ADMIN);
        usuario.addRol(admin);

        Permiso p = new Permiso();
        p.setNombre("ADMIN_TASK");
        admin.setPermisos(new HashSet<>(Set.of(p)));

        when(usuarioRepository.findByIdWithRolesAndPermisos(userId)).thenReturn(Optional.of(usuario));

        assertTrue(usuarioService.hasRole(userId, Constants.ROLE_ADMIN));
        assertTrue(usuarioService.isAdmin(userId));
        assertTrue(usuarioService.hasPermission(userId, "ADMIN_TASK"));
        assertFalse(usuarioService.hasPermission(userId, "NON_EXISTENT"));
    }

    @Test
    void updateUsuario_successUpdatesFieldsAndRoles() {
        Long userId = 1L;
        Usuario existing = new Usuario("Old", "old@example.com");
        existing.addRol(new Rol()); // initial role to be cleared

        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(existing));

        Rol newRole = new Rol();
        when(rolRepository.findAllById(List.of(10L))).thenReturn(List.of(newRole));

        usuarioService.updateUsuario(userId, "New", "new@example.com", List.of(10L));

        verify(usuarioRepository).save(usuarioCaptor.capture());
        Usuario saved = usuarioCaptor.getValue();
        assertEquals("New", saved.getNombre());
        assertEquals("new@example.com", saved.getEmail());
        assertTrue(saved.getRoles().contains(newRole));
    }

    @Test
    void updateUsuario_notFoundThrows() {
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> usuarioService.updateUsuario(999L, "N", "n@example.com", List.of()));
    }

    @Test
    void deleteDelegatesToRepository() {
        usuarioService.delete(5L);
        verify(usuarioRepository).deleteById(5L);
    }
}