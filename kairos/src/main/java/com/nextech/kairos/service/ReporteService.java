package com.nextech.kairos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Reporte;
import com.nextech.kairos.repository.ProyectoRepository;
import com.nextech.kairos.repository.ReporteRepository;

@Service
@Transactional 
public class ReporteService {
    
    private final ReporteRepository reporteRepository;
    private final ProyectoRepository proyectoRepository;

    @Autowired
    public ReporteService(ReporteRepository reporteRepository, ProyectoRepository proyectoRepository) {
        this.reporteRepository = reporteRepository;
        this.proyectoRepository = proyectoRepository;
    }
    @Transactional(readOnly = true)
    public List<Reporte> findAll() {
        return reporteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Reporte> findById(Long idReporte) {
        return reporteRepository.findById(idReporte);
    }
    
    /**
     * Crea un nuevo reporte y lo asocia a un proyecto
     * @param reporte Objeto Reporte a guardar.
     * @param idProyecto ID del proyecto padre.
     * @return El reporte guardado.
     */
    public Reporte createReporte(Reporte reporte, Long idProyecto) {
        Proyecto proyecto = proyectoRepository.findById(idProyecto)
            .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con ID: " + idProyecto));
        
        if (reporte.getFechaReporte() == null) {
            reporte.setFechaReporte(LocalDate.now());
        }
        reporte.setProyecto(proyecto);
        return reporteRepository.save(reporte);
    }
    // actualizacion, verificar esto es si es necesario 
    // /**
    //  * Actualiza un reporte
    //  */
    // public Reporte updateReporte(Long idReporte, Reporte detallesReporte) {
    //     return reporteRepository.findById(idReporte).map(reporteExistente -> {
            
    //         // Actualizar campos
    //         reporteExistente.setFormato(detallesReporte.getFormato());
    //         reporteExistente.setFechaReporte(detallesReporte.getFechaReporte());
            
    //         return reporteRepository.save(reporteExistente);
            
    //     }).orElseThrow(() -> new RuntimeException("Reporte no encontrado con ID: " + idReporte));
    // }

    public void delete(Long idReporte) {
        reporteRepository.deleteById(idReporte);
    }
    @Transactional(readOnly = true)
    public List<Reporte> findReportesByProyecto(Long idProyecto) {
        return reporteRepository.findByProyectoIdProyecto(idProyecto);
    }

    @Transactional(readOnly = true)
    public List<Reporte> findReportesByFormato(String formato) {
        return reporteRepository.findByFormato(formato);
    }
    
    @Transactional(readOnly = true)
    public List<Reporte> findReportesByProyectoOrdered(Long idProyecto) {
        return reporteRepository.findByProyectoIdProyectoOrderByFechaReporteDesc(idProyecto);
    }
    
    @Transactional(readOnly = true)
    public List<Reporte> findReportesByDate(LocalDate fecha) {
        return reporteRepository.findByFechaReporte(fecha);
    }
}