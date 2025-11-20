
package com.nextech.kairos.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.*;
import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.repository.CategoriaRepository;
import com.nextech.kairos.repository.ProyectoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;






@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProyectoRepository proyectoRepository;

    @InjectMocks
    private CategoriaService categoriaService;

    private Categoria sampleCategoria;
    private Proyecto sampleProyecto;

    @BeforeEach
    void setUp() {
        sampleCategoria = new Categoria();
        sampleCategoria.setIdCategoria(1L);
        sampleCategoria.setNombre("Cat A");
        sampleCategoria.setDescripcion("Desc A");

        sampleProyecto = new Proyecto();
        sampleProyecto.setIdProyecto(10L);
        sampleCategoria.setProyecto(sampleProyecto);
    }

    @Test
    void listarCategorias_delegaARepository() {
        List<Categoria> list = List.of(sampleCategoria);
        when(categoriaRepository.findAll()).thenReturn(list);

        List<Categoria> result = categoriaService.listarCategorias();

        assertSame(list, result);
        verify(categoriaRepository).findAll();
    }

    @Test
    void obtenerPorId_delegaARepository() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(sampleCategoria));

        Optional<Categoria> opt = categoriaService.obtenerPorId(1L);

        assertTrue(opt.isPresent());
        assertEquals("Cat A", opt.get().getNombre());
        verify(categoriaRepository).findById(1L);
    }

    @Test
    void guardarCategoria_delegaSave() {
        when(categoriaRepository.save(sampleCategoria)).thenReturn(sampleCategoria);

        Categoria saved = categoriaService.guardarCategoria(sampleCategoria);

        assertSame(sampleCategoria, saved);
        verify(categoriaRepository).save(sampleCategoria);
    }

    @Test
    void crearCategoria_lanzaSiProyectoNoExiste() {
        when(proyectoRepository.findById(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            categoriaService.crearCategoria(sampleCategoria)
        );
        assertTrue(ex.getMessage().contains("Proyecto no encontrado"));
    }

    @Test
    void crearCategoria_lanzaSiNombreDuplicadoEnMismoProyecto() {
        when(proyectoRepository.findById(10L)).thenReturn(Optional.of(sampleProyecto));
        when(categoriaRepository.findByProyectoIdProyectoAndNombre(10L, "Cat A"))
            .thenReturn(List.of(new Categoria()));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            categoriaService.crearCategoria(sampleCategoria)
        );
        assertTrue(ex.getMessage().toLowerCase().contains("categor"));
    }

    @Test
    void crearCategoria_asignaProyectoYGuarda() {
        when(proyectoRepository.findById(10L)).thenReturn(Optional.of(sampleProyecto));
        when(categoriaRepository.findByProyectoIdProyectoAndNombre(10L, "Cat A"))
            .thenReturn(Collections.emptyList());
        when(categoriaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Categoria created = categoriaService.crearCategoria(sampleCategoria);

        assertEquals(sampleProyecto, created.getProyecto());
        verify(categoriaRepository).save(created);
    }

    @Test
    void actualizarCategoria_lanzaSiNoExiste() {
        when(categoriaRepository.findById(2L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            categoriaService.actualizarCategoria(2L, sampleCategoria)
        );
        assertTrue(ex.getMessage().toLowerCase().contains("categoria"));
    }

    @Test
    void actualizarCategoria_lanzaSiNuevoNombreDuplicadoEnProyecto() {
        Categoria existing = new Categoria();
        existing.setIdCategoria(1L);
        existing.setNombre("Old");
        Proyecto p = new Proyecto();
        p.setIdProyecto(10L);
        existing.setProyecto(p);

        Categoria detalles = new Categoria();
        detalles.setNombre("New");

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));
        // Simulate another category with same new name and different id -> duplication
        Categoria other = new Categoria();
        other.setIdCategoria(2L);
        when(categoriaRepository.findByProyectoIdProyectoAndNombre(10L, "New"))
            .thenReturn(List.of(other));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            categoriaService.actualizarCategoria(1L, detalles)
        );
        assertTrue(ex.getMessage().toLowerCase().contains("categor"));
    }

    @Test
    void actualizarCategoria_actualizaYSavesCuandoNoDuplicado() {
        Categoria existing = new Categoria();
        existing.setIdCategoria(1L);
        existing.setNombre("Old");
        existing.setDescripcion("D1");
        Proyecto p = new Proyecto();
        p.setIdProyecto(10L);
        existing.setProyecto(p);

        Categoria detalles = new Categoria();
        detalles.setNombre("Old"); // same name -> skip duplicate check
        detalles.setDescripcion("D2");

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoriaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Categoria updated = categoriaService.actualizarCategoria(1L, detalles);

        assertEquals("D2", updated.getDescripcion());
        verify(categoriaRepository).save(existing);
    }

    @Test
    void eliminarCategoria_delegaARepository() {
        doNothing().when(categoriaRepository).deleteById(5L);

        categoriaService.eliminarCategoria(5L);

        verify(categoriaRepository).deleteById(5L);
    }

    @Test
    void buscarPorNombre_delega() {
        when(categoriaRepository.findByNombre("X")).thenReturn(Optional.of(sampleCategoria));

        Optional<Categoria> found = categoriaService.buscarPorNombre("X");

        assertTrue(found.isPresent());
        verify(categoriaRepository).findByNombre("X");
    }

    @Test
    void buscarPorProyecto_delega() {
        List<Categoria> resultList = List.of(sampleCategoria);
        when(categoriaRepository.findByProyectoIdProyecto(10L)).thenReturn(resultList);

        List<Categoria> res = categoriaService.buscarPorProyecto(10L);

        assertEquals(1, res.size());
        verify(categoriaRepository).findByProyectoIdProyecto(10L);
    }

    @Test
    void buscarPorNombreContiene_delega() {
        when(categoriaRepository.findByNombreContainingIgnoreCase("part"))
            .thenReturn(List.of(sampleCategoria));

        List<Categoria> res = categoriaService.buscarPorNombreContiene("part");

        assertEquals(1, res.size());
        verify(categoriaRepository).findByNombreContainingIgnoreCase("part");
    }

    @Test
    void buscarPorProyectoYNombre_convierteStreamAList() {
        when(categoriaRepository.findByProyectoIdProyectoAndNombre(10L, "Cat A"))
            .thenReturn(List.of(sampleCategoria));

        List<Categoria> res = categoriaService.buscarPorProyectoYNombre(10L, "Cat A");

        assertEquals(1, res.size());
        verify(categoriaRepository).findByProyectoIdProyectoAndNombre(10L, "Cat A");
    }

    @Test
    void buscarPorTarea_delega() {
        when(categoriaRepository.findByTareas_IdTarea(99L)).thenReturn(List.of(sampleCategoria));

        List<Categoria> res = categoriaService.buscarPorTarea(99L);

        assertEquals(1, res.size());
        verify(categoriaRepository).findByTareas_IdTarea(99L);
    }

    @Test
    void contarPorProyecto_delega() {
        when(categoriaRepository.countByProyectoIdProyecto(10L)).thenReturn(7L);

        long count = categoriaService.contarPorProyecto(10L);

        assertEquals(7L, count);
        verify(categoriaRepository).countByProyectoIdProyecto(10L);
    }

    @Test
    void obtenerTareasPorCategoriaId_lanzaSiNoExiste() {
        when(categoriaRepository.findById(123L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            categoriaService.obtenerTareasPorCategoriaId(123L)
        );
        assertTrue(ex.getMessage().toLowerCase().contains("categoria"));
    }

    @Test
    void obtenerTareasPorCategoriaId_devuelveTareas() {
        Categoria cat = new Categoria();
        cat.setIdCategoria(1L);
        Set<Tarea> tareas = new HashSet<>();
        Tarea t = new Tarea();
        t.setIdTarea(55L);
        tareas.add(t);
        cat.setTareas(tareas);

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(cat));

        Set<Tarea> res = categoriaService.obtenerTareasPorCategoriaId(1L);

        assertEquals(1, res.size());
        assertTrue(res.contains(t));
        verify(categoriaRepository).findById(1L);
    }
}
