package com.nextech.kairos.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entidad de cronómetro activo por usuario.
 * Restricción única asegura un solo cronómetro activo por usuario.
 */
@Entity
@Table(name = "tiempo_activo", uniqueConstraints = {
    @jakarta.persistence.UniqueConstraint(name = "uk_tiempo_activo_usuario", columnNames = {"idUsuario"})
})
public class TiempoActivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTiempoActivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idTarea", nullable = false)
    private Tarea tarea;

    @Column(name = "inicio", nullable = false)
    private LocalDateTime inicio;

    public Long getIdTiempoActivo() { return idTiempoActivo; }
    public void setIdTiempoActivo(Long idTiempoActivo) { this.idTiempoActivo = idTiempoActivo; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Tarea getTarea() { return tarea; }
    public void setTarea(Tarea tarea) { this.tarea = tarea; }

    public LocalDateTime getInicio() { return inicio; }
    public void setInicio(LocalDateTime inicio) { this.inicio = inicio; }
}
