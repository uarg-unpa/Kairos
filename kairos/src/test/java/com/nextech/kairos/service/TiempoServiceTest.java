package com.nextech.kairos.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Tiempo;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.repository.TiempoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;





@ExtendWith(MockitoExtension.class)
class TiempoServiceTest {

    @Mock
    TiempoRepository tiempoRepository;

    @Mock
    UsuarioService usuarioService;

    @Mock
    TareaService tareaService;

    @InjectMocks
    TiempoService tiempoService;

    @Test
    void findAllReturnsRepositoryList() {
        List<Tiempo> expected = Arrays.asList(new Tiempo(), new Tiempo());
        when(tiempoRepository.findAll()).thenReturn(expected);

        List<Tiempo> actual = tiempoService.findAll();

        assertSame(expected, actual);
        verify(tiempoRepository).findAll();
    }

    @Test
    void findByIdReturnsOptionalFromRepository() {
        Tiempo t = new Tiempo();
        when(tiempoRepository.findById(1L)).thenReturn(Optional.of(t));

        Optional<Tiempo> result = tiempoService.findById(1L);

        assertTrue(result.isPresent());
        assertSame(t, result.get());
        verify(tiempoRepository).findById(1L);
    }

    @Test
    void registerTimeThrowsWhenTareaNotFound() {
        when(tareaService.obtenerPorId(10L)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                tiempoService.registerTime(new Tiempo(), 10L, 1L, 60, LocalDate.now(), "desc"));

        assertTrue(ex.getMessage().contains("Tarea no encontrada"));
    }

    @Test
    void registerTimeThrowsWhenUsuarioNotFound() {
        when(tareaService.obtenerPorId(2L)).thenReturn(new Tarea());
        when(usuarioService.findById(5L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                tiempoService.registerTime(new Tiempo(), 2L, 5L, 60, LocalDate.now(), "desc"));

        assertTrue(ex.getMessage().contains("Usuario no encontrado"));
    }

    @Test
    void registerTimeThrowsWhenDurationInvalid() {
        when(tareaService.obtenerPorId(2L)).thenReturn(new Tarea());
        when(usuarioService.findById(5L)).thenReturn(Optional.of(new Usuario()));

        RuntimeException ex1 = assertThrows(RuntimeException.class, () ->
                tiempoService.registerTime(new Tiempo(), 2L, 5L, 0, LocalDate.now(), "desc"));
        assertTrue(ex1.getMessage().contains("duraci"));

        RuntimeException ex2 = assertThrows(RuntimeException.class, () ->
                tiempoService.registerTime(new Tiempo(), 2L, 5L, null, LocalDate.now(), "desc"));
        assertTrue(ex2.getMessage().contains("duraci"));
    }

    @Test
    void registerTimeSavesRoundedMinutesAndSetsNowWhenFechaRegistroNull() {
        Tarea tarea = new Tarea();
        Usuario usuario = new Usuario();
        when(tareaService.obtenerPorId(3L)).thenReturn(tarea);
        when(usuarioService.findById(7L)).thenReturn(Optional.of(usuario));
        when(tiempoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Tiempo input = new Tiempo();
        input.setFechaRegistro(null);

        Tiempo saved = tiempoService.registerTime(input, 3L, 7L, 61, LocalDate.of(2020, 1, 1), "x");

        assertSame(tarea, saved.getTarea());
        assertSame(usuario, saved.getUsuario());
        assertEquals(2, saved.getDuracion()); // 61 seconds -> 2 minutes
        assertEquals(LocalDate.now(), saved.getFechaRegistro());
    }

    @Test
    void registerTimeUsesProvidedFechaWhenTiempoHasNonNullFecha() {
        Tarea tarea = new Tarea();
        Usuario usuario = new Usuario();
        when(tareaService.obtenerPorId(4L)).thenReturn(tarea);
        when(usuarioService.findById(8L)).thenReturn(Optional.of(usuario));
        when(tiempoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Tiempo input = new Tiempo();
        input.setFechaRegistro(LocalDate.of(2019, 1, 1)); // non-null -> service will overwrite with fechaRegistro param
        LocalDate provided = LocalDate.of(2021, 2, 2);

        Tiempo saved = tiempoService.registerTime(input, 4L, 8L, 120, provided, "y");

        assertEquals(2, saved.getDuracion());
        assertEquals(provided, saved.getFechaRegistro());
    }

    @Test
    void deleteInvokesRepositoryDelete() {
        tiempoService.delete(11L);
        verify(tiempoRepository).deleteById(11L);
    }

    @Test
    void findTimeByTaskDelegatesToRepository() {
        when(tiempoRepository.findByTareaIdTarea(22L)).thenReturn(Collections.emptyList());
        List<Tiempo> res = tiempoService.findTimeByTask(22L);
        assertNotNull(res);
        verify(tiempoRepository).findByTareaIdTarea(22L);
    }

    @Test
    void findTimeByUserDelegatesToRepository() {
        when(tiempoRepository.findByUsuarioId(33L)).thenReturn(Collections.emptyList());
        List<Tiempo> res = tiempoService.findTimeByUser(33L);
        assertNotNull(res);
        verify(tiempoRepository).findByUsuarioId(33L);
    }

    @Test
    void findTimeForTaskAndUserDelegatesToRepository() {
        when(tiempoRepository.findByTareaIdTareaAndUsuarioId(1L, 2L)).thenReturn(Collections.emptyList());
        List<Tiempo> res = tiempoService.findTimeForTaskAndUser(1L, 2L);
        assertNotNull(res);
        verify(tiempoRepository).findByTareaIdTareaAndUsuarioId(1L, 2L);
    }

    @Test
    void findTimeByDateRangeValidatesAndDelegates() {
        LocalDate start = LocalDate.of(2020, 1, 1);
        LocalDate end = LocalDate.of(2020, 1, 31);
        when(tiempoRepository.findByFechaRegistroBetween(start, end)).thenReturn(Collections.emptyList());

        List<Tiempo> res = tiempoService.findTimeByDateRange(start, end);
        assertNotNull(res);
        verify(tiempoRepository).findByFechaRegistroBetween(start, end);
    }

    @Test
    void findTimeByDateRangeThrowsOnInvalidRange() {
        LocalDate a = LocalDate.of(2021, 5, 1);
        LocalDate b = LocalDate.of(2021, 4, 1);

        assertThrows(IllegalArgumentException.class, () -> tiempoService.findTimeByDateRange(null, b));
        assertThrows(IllegalArgumentException.class, () -> tiempoService.findTimeByDateRange(a, null));
        assertThrows(IllegalArgumentException.class, () -> tiempoService.findTimeByDateRange(a, b));
    }

    @Test
    void calculateTotalTimeByTaskSumsDurations() {
        Tiempo t1 = new Tiempo();
        t1.setDuracion(3);
        Tiempo t2 = new Tiempo();
        t2.setDuracion(7);
        when(tiempoRepository.findByTareaIdTarea(99L)).thenReturn(Arrays.asList(t1, t2));

        Integer total = tiempoService.calculateTotalTimeByTask(99L);
        assertEquals(10, total.intValue());
    }
}