package com.nextech.kairos.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.repository.PermisoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;





@ExtendWith(MockitoExtension.class)
class PermisoServiceTest {

    @Mock
    private PermisoRepository permisoRepository;

    @InjectMocks
    private PermisoService permisoService;

    @BeforeEach
    void setUp() {
        // MockitoExtension initializes mocks
    }

    @Test
    void testSaveDelegatesToRepository() {
        Permiso permiso = new Permiso("READ");
        when(permisoRepository.save(permiso)).thenReturn(permiso);

        Permiso result = permisoService.save(permiso);

        assertSame(permiso, result);
        verify(permisoRepository).save(permiso);
    }

    @Test
    void testFindByIdReturnsOptional() {
        Permiso permiso = new Permiso("WRITE");
        when(permisoRepository.findById(1L)).thenReturn(Optional.of(permiso));

        Optional<Permiso> result = permisoService.findById(1L);

        assertTrue(result.isPresent());
        assertSame(permiso, result.get());
        verify(permisoRepository).findById(1L);
    }

    @Test
    void testFindByNameReturnsOptional() {
        Permiso permiso = new Permiso("EXECUTE");
        when(permisoRepository.findByNombre("EXECUTE")).thenReturn(Optional.of(permiso));

        Optional<Permiso> result = permisoService.findByName("EXECUTE");

        assertTrue(result.isPresent());
        assertSame(permiso, result.get());
        verify(permisoRepository).findByNombre("EXECUTE");
    }

    @Test
    void testFindAllAndFindAllWithRoles() {
        Permiso p1 = new Permiso("A");
        Permiso p2 = new Permiso("B");
        when(permisoRepository.findAll()).thenReturn(Arrays.asList(p1, p2));
        when(permisoRepository.findAllWithRoles()).thenReturn(Collections.singletonList(p1));

        List<Permiso> all = permisoService.findAll();
        List<Permiso> withRoles = permisoService.findAllWithRoles();

        assertEquals(2, all.size());
        assertEquals(1, withRoles.size());
        verify(permisoRepository).findAll();
        verify(permisoRepository).findAllWithRoles();
    }

    @Test
    void testCreatePermissionSuccess() {
        String nombre = "NEW";
        when(permisoRepository.existsByNombre(nombre)).thenReturn(false);
        Permiso saved = new Permiso(nombre);
        when(permisoRepository.save(any(Permiso.class))).thenReturn(saved);

        Permiso result = permisoService.createPermission(nombre);

        assertNotNull(result);
        verify(permisoRepository).existsByNombre(nombre);
        ArgumentCaptor<Permiso> captor = ArgumentCaptor.forClass(Permiso.class);
        verify(permisoRepository).save(captor.capture());
        assertEquals(nombre, captor.getValue().getNombre());
    }

    @Test
    void testCreatePermissionAlreadyExistsThrows() {
        String nombre = "DUP";
        when(permisoRepository.existsByNombre(nombre)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> permisoService.createPermission(nombre));
        assertTrue(ex.getMessage().contains(nombre));
        verify(permisoRepository).existsByNombre(nombre);
        verify(permisoRepository, never()).save(any());
    }

    @Test
    void testDeleteDelegatesToRepository() {
        permisoService.delete(5L);
        verify(permisoRepository).deleteById(5L);
    }

    @Test
    void testCreatePermisoDelegatesToCreatePermission() {
        String nombre = "DELEG";
        when(permisoRepository.existsByNombre(nombre)).thenReturn(false);
        Permiso saved = new Permiso(nombre);
        when(permisoRepository.save(any(Permiso.class))).thenReturn(saved);

        Permiso result = permisoService.createPermiso(nombre);

        assertNotNull(result);
        verify(permisoRepository).existsByNombre(nombre);
        verify(permisoRepository).save(any(Permiso.class));
    }

    @Test
    void testUpdatePermisoSuccess() {
        Permiso existing = new Permiso("OLD");
        when(permisoRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(permisoRepository.save(existing)).thenReturn(existing);

        Permiso result = permisoService.updatePermiso(10L, "UPDATED");

        assertSame(existing, result);
        assertEquals("UPDATED", existing.getNombre());
        verify(permisoRepository).findById(10L);
        verify(permisoRepository).save(existing);
    }

    @Test
    void testUpdatePermisoNotFoundThrows() {
        when(permisoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> permisoService.updatePermiso(99L, "X"));
        assertTrue(ex.getMessage().contains("Permiso no encontrado"));
        verify(permisoRepository).findById(99L);
    }

    @Test
    void testDeletePermisoDelegates() {
        permisoService.deletePermiso(7L);
        verify(permisoRepository).deleteById(7L);
    }

    @Test
    void testSearchByNameAndOtherFinders() {
        Permiso p = new Permiso("abc");
        when(permisoRepository.findByNombreContainingIgnoreCase("ab")).thenReturn(Collections.singletonList(p));
        when(permisoRepository.findByRolId(2L)).thenReturn(Collections.singletonList(p));
        when(permisoRepository.findByRolName("ROLE")).thenReturn(Collections.singletonList(p));
        when(permisoRepository.findByUsuarioId(3L)).thenReturn(Collections.singletonList(p));
        when(permisoRepository.findByUsuarioEmail("u@x.com")).thenReturn(Collections.singletonList(p));

        assertEquals(1, permisoService.searchByName("ab").size());
        assertEquals(1, permisoService.getPermissionsByRole(2L).size());
        assertEquals(1, permisoService.getPermissionsByRoleName("ROLE").size());
        assertEquals(1, permisoService.getPermissionsByUser(3L).size());
        assertEquals(1, permisoService.getPermissionsByUserEmail("u@x.com").size());

        verify(permisoRepository).findByNombreContainingIgnoreCase("ab");
        verify(permisoRepository).findByRolId(2L);
        verify(permisoRepository).findByRolName("ROLE");
        verify(permisoRepository).findByUsuarioId(3L);
        verify(permisoRepository).findByUsuarioEmail("u@x.com");
    }
}