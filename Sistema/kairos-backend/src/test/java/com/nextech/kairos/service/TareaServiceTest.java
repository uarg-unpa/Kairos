package com.nextech.kairos.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.repository.TareaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;





@ExtendWith(MockitoExtension.class)
class TareaServiceTest {

    @Mock
    private TareaRepository tareaRepository;

    @InjectMocks
    private TareaService tareaService;

    @Test
    void listarTareas_returnsAllTareas() {
        Tarea t1 = mock(Tarea.class);
        Tarea t2 = mock(Tarea.class);
        List<Tarea> expected = Arrays.asList(t1, t2);

        when(tareaRepository.findAll()).thenReturn(expected);

        List<Tarea> actual = tareaService.listarTareas();

        assertSame(expected, actual);
        verify(tareaRepository).findAll();
    }

    @Test
    void obtenerPorId_whenFound_returnsTarea() {
        Long id = 1L;
        Tarea tarea = mock(Tarea.class);

        when(tareaRepository.findById(id)).thenReturn(Optional.of(tarea));

        Tarea result = tareaService.obtenerPorId(id);

        assertSame(tarea, result);
        verify(tareaRepository).findById(id);
    }

    @Test
    void obtenerPorId_whenNotFound_returnsNull() {
        Long id = 2L;

        when(tareaRepository.findById(id)).thenReturn(Optional.empty());

        Tarea result = tareaService.obtenerPorId(id);

        assertNull(result);
        verify(tareaRepository).findById(id);
    }

    @Test
    void guardarTarea_savesAndReturnsTarea() {
        Tarea tarea = mock(Tarea.class);

        when(tareaRepository.save(tarea)).thenReturn(tarea);

        Tarea saved = tareaService.guardarTarea(tarea);

        assertSame(tarea, saved);
        verify(tareaRepository).save(tarea);
    }

    @Test
    void eliminarTarea_callsDeleteById() {
        Long id = 3L;

        tareaService.eliminarTarea(id);

        verify(tareaRepository).deleteById(id);
    }

    @Test
    void listarPorHorasEstimadas_returnsMatching() {
        Double horas = 5.0;
        Tarea t = mock(Tarea.class);
        List<Tarea> expected = Arrays.asList(t);

        when(tareaRepository.findByHorasEstimadas(horas)).thenReturn(expected);

        List<Tarea> actual = tareaService.listarPorHorasEstimadas(horas);

        assertSame(expected, actual);
        verify(tareaRepository).findByHorasEstimadas(horas);
    }

    @Test
    void listarPorHorasEstimadasMayorQue_returnsMatching() {
        Double horas = 2.0;
        Tarea t = mock(Tarea.class);
        List<Tarea> expected = Arrays.asList(t);

        when(tareaRepository.findByHorasEstimadasGreaterThan(horas)).thenReturn(expected);

        List<Tarea> actual = tareaService.listarPorHorasEstimadasMayorQue(horas);

        assertSame(expected, actual);
        verify(tareaRepository).findByHorasEstimadasGreaterThan(horas);
    }

    @Test
    void listarPorHorasEstimadasMenorQue_returnsMatching() {
        Double horas = 8.0;
        Tarea t = mock(Tarea.class);
        List<Tarea> expected = Arrays.asList(t);

        when(tareaRepository.findByHorasEstimadasLessThan(horas)).thenReturn(expected);

        List<Tarea> actual = tareaService.listarPorHorasEstimadasMenorQue(horas);

        assertSame(expected, actual);
        verify(tareaRepository).findByHorasEstimadasLessThan(horas);
    }

    @Test
    void obtenerTareasPorUsuarioId_returnsMatching() {
        Long usuarioId = 10L;
        Tarea t = mock(Tarea.class);
        List<Tarea> expected = Arrays.asList(t);

        when(tareaRepository.findByUsuario_Id(usuarioId)).thenReturn(expected);

        List<Tarea> actual = tareaService.obtenerTareasPorUsuarioId(usuarioId);

        assertSame(expected, actual);
        verify(tareaRepository).findByUsuario_Id(usuarioId);
    }
}