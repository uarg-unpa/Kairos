
package com.nextech.kairos.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import com.nextech.kairos.model.Comentario;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.ComentarioRepository;
import com.nextech.kairos.repository.TareaRepository;
import com.nextech.kairos.repository.UsuarioRepository;
import com.nextech.kairos.service.ComentarioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;






@ExtendWith(MockitoExtension.class)
public class ComentarioServiceTest {

    @Mock
    private ComentarioRepository comentarioRepository;

    @Mock
    private TareaRepository tareaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ComentarioService comentarioService;

    @Test
    void testCreateComentario_setsDateAndAssociations() {
        Comentario comentario = new Comentario();
        comentario.setContenido("Hola mundo");
        comentario.setFechaComentario(null);

        Tarea tarea = new Tarea();
        Usuario usuario = new Usuario();

        when(tareaRepository.findById(1L)).thenReturn(Optional.of(tarea));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario));
        when(comentarioRepository.save(any(Comentario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comentario result = comentarioService.createComentario(comentario, 1L, 2L);

        assertNotNull(result.getFechaComentario());
        assertEquals(LocalDate.now(), result.getFechaComentario());
        assertSame(tarea, result.getTarea());
        assertSame(usuario, result.getUsuario());
        verify(comentarioRepository).save(result);
    }

    @Test
    void testCreateComentario_withNullUsuarioId_userIsNull() {
        Comentario comentario = new Comentario();
        comentario.setContenido("Sin usuario");
        comentario.setFechaComentario(null);

        Tarea tarea = new Tarea();

        when(tareaRepository.findById(10L)).thenReturn(Optional.of(tarea));
        when(comentarioRepository.save(any(Comentario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comentario saved = comentarioService.createComentario(comentario, 10L, null);

        assertNotNull(saved.getFechaComentario());
        assertSame(tarea, saved.getTarea());
        assertNull(saved.getUsuario());
        verify(comentarioRepository).save(saved);
    }

    @Test
    void testCreateComentario_emptyContent_throws() {
        Comentario comentario = new Comentario();
        comentario.setContenido("   "); // blank

        when(tareaRepository.findById(1L)).thenReturn(Optional.of(new Tarea()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            comentarioService.createComentario(comentario, 1L, null);
        });
        assertTrue(ex.getMessage().toLowerCase().contains("contenido"));
        verify(comentarioRepository, never()).save(any());
    }

    @Test
    void testCreateComentario_tareaNotFound_throws() {
        Comentario comentario = new Comentario();
        comentario.setContenido("Contenido valido");

        when(tareaRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            comentarioService.createComentario(comentario, 99L, null);
        });
        assertTrue(ex.getMessage().toLowerCase().contains("tarea no encontrada"));
        verify(comentarioRepository, never()).save(any());
    }

    @Test
    void testCreateComentario_usuarioNotFound_throws() {
        Comentario comentario = new Comentario();
        comentario.setContenido("Contenido valido");

        when(tareaRepository.findById(5L)).thenReturn(Optional.of(new Tarea()));
        when(usuarioRepository.findById(7L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            comentarioService.createComentario(comentario, 5L, 7L);
        });
        assertTrue(ex.getMessage().toLowerCase().contains("usuario no encontrado"));
        verify(comentarioRepository, never()).save(any());
    }

    @Test
    void testFindAll_delegatesToRepository() {
        Comentario c1 = new Comentario();
        Comentario c2 = new Comentario();
        List<Comentario> list = Arrays.asList(c1, c2);
        when(comentarioRepository.findAll()).thenReturn(list);

        List<Comentario> result = comentarioService.findAll();

        assertEquals(2, result.size());
        assertSame(list, result);
        verify(comentarioRepository).findAll();
    }

    @Test
    void testFindById_delegatesToRepository() {
        Comentario c = new Comentario();
        when(comentarioRepository.findById(3L)).thenReturn(Optional.of(c));

        Optional<Comentario> opt = comentarioService.findById(3L);

        assertTrue(opt.isPresent());
        assertSame(c, opt.get());
        verify(comentarioRepository).findById(3L);
    }

    @Test
    void testDelete_delegatesToRepository() {
        comentarioService.delete(4L);
        verify(comentarioRepository).deleteById(4L);
    }

    @Test
    void testFindComentariosByTarea_delegatesToRepository() {
        Comentario c = new Comentario();
        List<Comentario> list = Arrays.asList(c);
        when(comentarioRepository.findByTareaIdTarea(8L)).thenReturn(list);

        List<Comentario> result = comentarioService.findComentariosByTarea(8L);

        assertSame(list, result);
        verify(comentarioRepository).findByTareaIdTarea(8L);
    }

    @Test
    void testFindComentariosByUsuario_delegatesToRepository() {
        Comentario c = new Comentario();
        List<Comentario> list = Arrays.asList(c);
        when(comentarioRepository.findByUsuarioId(11L)).thenReturn(list);

        List<Comentario> result = comentarioService.findComentariosByUsuario(11L);

        assertSame(list, result);
        verify(comentarioRepository).findByUsuarioId(11L);
    }

    @Test
    void testFindComentariosByTareaOrderedByDate_delegatesToRepository() {
        Comentario c = new Comentario();
        List<Comentario> list = Arrays.asList(c);
        when(comentarioRepository.findByTareaIdTareaOrderByFechaComentarioDesc(15L)).thenReturn(list);

        List<Comentario> result = comentarioService.findComentariosByTareaOrderedByDate(15L);

        assertSame(list, result);
        verify(comentarioRepository).findByTareaIdTareaOrderByFechaComentarioDesc(15L);
    }
}
