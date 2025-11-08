package com.nextech.kairos.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.lang.reflect.Field;
import java.util.Optional;
import java.util.Set;

import com.nextech.kairos.config.Constants;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.service.RolService;
import com.nextech.kairos.service.UsuarioService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private RolService rolService;

    @InjectMocks
    private AuthService authService;

    private Usuario sampleUser;

    @BeforeEach
    void setup() throws Exception {
        // make sure adminEmails can be set on the authService instance
        Field adminField = AuthService.class.getDeclaredField("adminEmails");
        adminField.setAccessible(true);
        adminField.set(authService, "admin@example.com, other@example.com");

        sampleUser = new Usuario("Juan Perez", "juan@example.com");
        sampleUser.setId(42L);
    }

    @Test
    void authenticateWithGoogle_delegatesToUsuarioService() {
        when(usuarioService.createUserFromGoogle("Juan", "juan@google.com")).thenReturn(sampleUser);

        Usuario result = authService.authenticateWithGoogle("Juan", "juan@google.com");

        assertNotNull(result);
        assertEquals(sampleUser, result);
        verify(usuarioService, times(1)).createUserFromGoogle("Juan", "juan@google.com");
    }

    @Test
    void processGoogleLogin_existingUser_sameName_returnsUserWithoutSaving() throws Exception {
        Usuario existing = new Usuario("Juan", "juan@google.com");
        existing.setId(10L);

        when(usuarioService.findByEmail("juan@google.com")).thenReturn(Optional.of(existing));

        Usuario result = authService.processGoogleLogin("juan@google.com", "Juan");

        assertNotNull(result);
        assertEquals(existing, result);
        verify(usuarioService, never()).createUserFromGoogle(anyString(), anyString());
        verify(usuarioService, never()).save(any());
    }

    @Test
    void processGoogleLogin_existingUser_differentName_updatesAndSaves() throws Exception {
        Usuario existing = new Usuario("Old name", "juan@google.com");
        existing.setId(11L);

        when(usuarioService.findByEmail("juan@google.com")).thenReturn(Optional.of(existing));
        when(usuarioService.save(ArgumentMatchers.any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario result = authService.processGoogleLogin("juan@google.com", "Juan Nuevo");

        assertNotNull(result);
        assertEquals("Juan Nuevo", existing.getNombre());
        verify(usuarioService, never()).createUserFromGoogle(anyString(), anyString());
        verify(usuarioService, times(1)).save(existing);
    }

    @Test
    void processGoogleLogin_newUser_createsUser() throws Exception {
        when(usuarioService.findByEmail("new@google.com")).thenReturn(Optional.empty());
        Usuario created = new Usuario("New User", "new@google.com");
        created.setId(55L);
        when(usuarioService.createUserFromGoogle("New User", "new@google.com")).thenReturn(created);

        Usuario result = authService.processGoogleLogin("new@google.com", "New User");

        assertNotNull(result);
        assertEquals(created, result);
        verify(usuarioService, times(1)).createUserFromGoogle("New User", "new@google.com");
    }

    @Test
    void ensureAdminIfConfigured_assignsRoleWhenConfiguredAndNotAdmin() {
        String adminEmail = "admin@example.com";
        Usuario adminUser = new Usuario("Admin", adminEmail);
        adminUser.setId(99L);

        when(usuarioService.findByEmail(adminEmail)).thenReturn(Optional.of(adminUser));
        when(usuarioService.isAdmin(adminUser.getId())).thenReturn(false);

        Rol adminRol = new Rol("ADMIN");
        adminRol.setId(7L);
        when(rolService.findByName(Constants.ROLE_ADMIN)).thenReturn(Optional.of(adminRol));

        authService.ensureAdminIfConfigured(adminEmail);

        verify(usuarioService, times(1)).assignRole(adminUser.getId(), adminRol.getId());
    }

    @Test
    void ensureAdminIfConfigured_doesNothingIfUserAlreadyAdmin() {
        String adminEmail = "admin@example.com";
        Usuario adminUser = new Usuario("Admin", adminEmail);
        adminUser.setId(100L);

        when(usuarioService.findByEmail(adminEmail)).thenReturn(Optional.of(adminUser));
        when(usuarioService.isAdmin(adminUser.getId())).thenReturn(true);

        authService.ensureAdminIfConfigured(adminEmail);

        verify(usuarioService, never()).assignRole(anyLong(), anyLong());
    }

    @Test
    void hasSystemAccess_returnsTrueWhenPermissionPresent() {
        String email = "juan@example.com";
        when(usuarioService.findByEmail(email)).thenReturn(Optional.of(sampleUser));
        when(usuarioService.getUserPermissions(sampleUser.getId())).thenReturn(Set.of(Constants.PERMISSION_INGRESAR, "OTH"));

        boolean allowed = authService.hasSystemAccess(email);

        assertTrue(allowed);
    }

    @Test
    void hasSystemAccess_returnsFalseWhenUserMissingOrNoPermission() {
        String email = "no_user@example.com";
        when(usuarioService.findByEmail(email)).thenReturn(Optional.empty());

        assertFalse(authService.hasSystemAccess(email));

        String email2 = "juan@example.com";
        when(usuarioService.findByEmail(email2)).thenReturn(Optional.of(sampleUser));
        when(usuarioService.getUserPermissions(sampleUser.getId())).thenReturn(Set.of("OTHER"));

        assertFalse(authService.hasSystemAccess(email2));
    }

    @Test
    void hasPermission_delegatesToUsuarioService() {
        String email = "juan@example.com";
        when(usuarioService.findByEmail(email)).thenReturn(Optional.of(sampleUser));
        when(usuarioService.hasPermission(sampleUser.getId(), "SOME")).thenReturn(true);

        assertTrue(authService.hasPermission(email, "SOME"));
        verify(usuarioService, times(1)).hasPermission(sampleUser.getId(), "SOME");
    }

    @Test
    void isAdmin_delegatesToUsuarioService() {
        String email = "juan@example.com";
        when(usuarioService.findByEmail(email)).thenReturn(Optional.of(sampleUser));
        when(usuarioService.isAdmin(sampleUser.getId())).thenReturn(true);

        assertTrue(authService.isAdmin(email));
        verify(usuarioService, times(1)).isAdmin(sampleUser.getId());
    }

    @Test
    void getUserForSession_returnsOptionalFromUsuarioService() {
        String email = "juan@example.com";
        when(usuarioService.findByEmail(email)).thenReturn(Optional.of(sampleUser));

        Optional<Usuario> found = authService.getUserForSession(email);

        assertTrue(found.isPresent());
        assertEquals(sampleUser, found.get());
    }

    @Test
    void getUserPermissionsForSession_returnsPermissionsOrEmptySet() {
        String email = "juan@example.com";
        when(usuarioService.findByEmail(email)).thenReturn(Optional.of(sampleUser));
        when(usuarioService.getUserPermissions(sampleUser.getId())).thenReturn(Set.of("A", "B"));

        Set<String> perms = authService.getUserPermissionsForSession(email);

        assertEquals(2, perms.size());
        assertTrue(perms.contains("A"));

        String missing = "missing@example.com";
        when(usuarioService.findByEmail(missing)).thenReturn(Optional.empty());

        Set<String> empty = authService.getUserPermissionsForSession(missing);
        assertNotNull(empty);
        assertTrue(empty.isEmpty());
    }
}