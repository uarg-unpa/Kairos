package com.nextech.kairos.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "reporte")
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReporte;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDate fechaReporte;

    @NotBlank
    @Size(max = 50)
    @Column(name = "formato", nullable = false, length = 50)
    private String formato;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProyecto", nullable = false)
    private Proyecto proyecto;

    public Reporte() {}

    public Long getIdReporte() { return idReporte; }
    public void setIdReporte(Long idReporte) { this.idReporte = idReporte; }
    public LocalDate getFechaReporte() { return fechaReporte; }
    public void setFechaReporte(LocalDate fechaReporte) { this.fechaReporte = fechaReporte; }
    public String getFormato() { return formato; }
    public void setFormato(String formato) { this.formato = formato; }
    public Proyecto getProyecto() { return proyecto; }
    public void setProyecto(Proyecto proyecto) { this.proyecto = proyecto; }
}