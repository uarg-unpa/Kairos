package com.nextech.kairos.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.Arrays;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.repository.PermisoRepository;
import com.nextech.kairos.repository.RolRepository;






@ExtendWith(MockitoExtension.class)
class RolServiceTest {

    @Mock
    private RolRepository rolRepository;

    @Mock
    private PermisoRepository permisoRepository;

    @InjectMocks
    private RolService rolService;

    @Test
    void createRole_whenExists_throws() {
        when(rolRepository.existsByNombre("ADMIN")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> rolService.createRole("ADMIN"));
        assertTrue(ex.getMessage().contains("El rol ya existe"));
        verify(rolRepository, never()).save(any());
    }

    @Test
    void createRole_savesNewRole() {
        when(rolRepository.existsByNombre("USER")).thenReturn(false);
        when(rolRepository.save(any(Rol.class))).thenAnswer(i -> i.getArgument(0));

        Rol result = rolService.createRole("USER");
        assertEquals("USER", result.getNombre());
        verify(rolRepository).save(result);
    }

    @Test
    void assignPermission_success() {
        Rol rol = new Rol("ADMIN");
        Permiso permiso = new Permiso("READ");
        when(rolRepository.findById(1L)).thenReturn(Optional.of(rol));
        when(permisoRepository.findById(2L)).thenReturn(Optional.of(permiso));
        when(rolRepository.save(any(Rol.class))).thenAnswer(i -> i.getArgument(0));

        Rol updated = rolService.assignPermission(1L, 2L);

        assertTrue(updated.getPermisos().stream().anyMatch(p -> "READ".equals(p.getNombre())));
        verify(rolRepository).save(rol);
    }

    @Test
    void assignPermission_missing_throws() {
        when(rolRepository.findById(1L)).thenReturn(Optional.empty());
        when(permisoRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> rolService.assignPermission(1L, 2L));
    }

    @Test
    void removePermission_success() {
        Rol rol = new Rol("MANAGER");
        Permiso permiso = new Permiso("WRITE");
        rol.addPermiso(permiso);

        when(rolRepository.findById(10L)).thenReturn(Optional.of(rol));
        when(permisoRepository.findById(20L)).thenReturn(Optional.of(permiso));
        when(rolRepository.save(any(Rol.class))).thenAnswer(i -> i.getArgument(0));

        Rol result = rolService.removePermission(10L, 20L);
        assertTrue(result.getPermisos().isEmpty());
        verify(rolRepository).save(rol);
    }

    @Test
    void removePermission_missing_throws() {
        when(rolRepository.findById(5L)).thenReturn(Optional.empty());
        when(permisoRepository.findById(6L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> rolService.removePermission(5L, 6L));
    }

    @Test
    void getRolePermissions_present_and_hasPermission() {
        Rol rol = new Rol("TEST");
        Permiso p1 = new Permiso("A");
        Permiso p2 = new Permiso("B");
        rol.addPermiso(p1);
        rol.addPermiso(p2);

        when(rolRepository.findByIdWithPermisos(3L)).thenReturn(Optional.of(rol));

        Set<String> permisos = rolService.getRolePermissions(3L);
        assertEquals(2, permisos.size());
        assertTrue(permisos.contains("A"));
        assertTrue(rolService.hasPermission(3L, "B"));
        assertFalse(rolService.hasPermission(3L, "C"));
    }

    @Test
    void getRolePermissions_notFound_returnsEmpty() {
        when(rolRepository.findByIdWithPermisos(7L)).thenReturn(Optional.empty());
        Set<String> permisos = rolService.getRolePermissions(7L);
        assertTrue(permisos.isEmpty());
    }

    @Test
    void createRol_withPermisos_savesAll() {
        when(rolRepository.existsByNombre("ROLE_X")).thenReturn(false);
        Permiso p1 = new Permiso("P1");
        Permiso p2 = new Permiso("P2");
        when(permisoRepository.findAllById(Arrays.asList(1L, 2L))).thenReturn(Arrays.asList(p1, p2));
        when(rolRepository.save(any(Rol.class))).thenAnswer(i -> i.getArgument(0));

        Rol created = rolService.createRol("ROLE_X", Arrays.asList(1L, 2L));
        assertEquals("ROLE_X", created.getNombre());
        assertEquals(2, created.getPermisos().size());
        verify(rolRepository).save(created);
    }

    @Test
    void updateRol_success_replacesPermisosAndName() {
        Rol existing = new Rol("OLD");
        existing.addPermiso(new Permiso("OLDP"));
        when(rolRepository.findById(11L)).thenReturn(Optional.of(existing));
        Permiso np1 = new Permiso("NEW1");
        when(permisoRepository.findAllById(Arrays.asList(100L))).thenReturn(Arrays.asList(np1));
        when(rolRepository.save(any(Rol.class))).thenAnswer(i -> i.getArgument(0));

        Rol updated = rolService.updateRol(11L, "NEW", Arrays.asList(100L));
        assertEquals("NEW", updated.getNombre());
        assertEquals(1, updated.getPermisos().size());
        assertTrue(updated.getPermisos().stream().anyMatch(p -> "NEW1".equals(p.getNombre())));
    }

    @Test
    void updateRol_notFound_throws() {
        when(rolRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> rolService.updateRol(999L, "X", null));
    }

    @Test
    void searchAndQueryDelegation_and_delete() {
        Rol r1 = new Rol("Alpha");
        when(rolRepository.findByNombreContainingIgnoreCase("alp")).thenReturn(Arrays.asList(r1));
        when(rolRepository.findByPermisoName("READ")).thenReturn(Arrays.asList(r1));
        when(rolRepository.findByUsuarioId(55L)).thenReturn(Arrays.asList(r1));

        assertEquals(1, rolService.searchByName("alp").size());
        assertEquals(1, rolService.getRolesWithPermission("READ").size());
        assertEquals(1, rolService.getRolesByUser(55L).size());

        rolService.deleteRol(123L);
        verify(rolRepository).deleteById(123L);
    }
}