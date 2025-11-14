package com.nextech.kairos.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.repository.IteracionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;





@ExtendWith(MockitoExtension.class)
class IteracionServiceTest {

    @Mock
    private IteracionRepository iteracionRepository;

    @InjectMocks
    private IteracionService iteracionService;

    @Test
    void listarIteraciones_debeRetornarListaDesdeRepositorio() {
        Iteracion i1 = new Iteracion();
        Iteracion i2 = new Iteracion();
        List<Iteracion> expected = Arrays.asList(i1, i2);

        when(iteracionRepository.findAll()).thenReturn(expected);

        List<Iteracion> actual = iteracionService.listarIteraciones();

        assertEquals(expected, actual);
        verify(iteracionRepository).findAll();
    }

    @Test
    void obtenerPorId_cuandoExiste_debeRetornarEntidad() {
        Iteracion iteracion = new Iteracion();
        Long id = 1L;

        when(iteracionRepository.findById(id)).thenReturn(Optional.of(iteracion));

        Iteracion result = iteracionService.obtenerPorId(id).orElse(null);

        assertNotNull(result);
        assertEquals(iteracion, result);
        verify(iteracionRepository).findById(id);
    }

    @Test
    void obtenerPorId_cuandoNoExiste_debeRetornarNull() {
        Long id = 2L;

        when(iteracionRepository.findById(id)).thenReturn(Optional.empty());

        Iteracion result = iteracionService.obtenerPorId(id).orElse(null);

        assertNull(result);
        verify(iteracionRepository).findById(id);
    }

    @Test
    void guardarIteracion_debeDelegarYRetornarValorRepositorio() {
        Iteracion iteracion = new Iteracion();

        when(iteracionRepository.save(iteracion)).thenReturn(iteracion);

        Iteracion saved = iteracionService.guardarIteracion(iteracion);

        assertSame(iteracion, saved);
        verify(iteracionRepository).save(iteracion);
    }

    @Test
    void eliminarIteracion_debeLlamarDeleteByIdEnRepositorio() {
        Long id = 3L;

        doNothing().when(iteracionRepository).deleteById(id);

        iteracionService.eliminarIteracion(id);

        verify(iteracionRepository).deleteById(id);
    }
}