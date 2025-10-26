package com.nextech.kairos.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.service.TareaService;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "http://localhost:4200")
public class TareaController {

    @Autowired
    private TareaService tareaService;

    @GetMapping
    public List<Tarea> listar() {
        return tareaService.listarTareas();
    }

    @GetMapping("/{id}")
    public Tarea obtener(@PathVariable Integer id) {
        return tareaService.obtenerPorId(id);
    }

    @PostMapping
    public Tarea guardar(@RequestBody Tarea tarea) {
        return tareaService.guardarTarea(tarea);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        tareaService.eliminarTarea(id);
    }
}
