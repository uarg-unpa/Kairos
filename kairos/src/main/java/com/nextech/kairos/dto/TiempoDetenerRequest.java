package com.nextech.kairos.dto;

/**
 * Payload opcional para detener el cronómetro.
 * Permite enviar la duración efectiva en segundos (descontando pausas) calculada en el frontend.
 */
public class TiempoDetenerRequest {
    // Segundos efectivos a registrar (opcional)
    private Integer duracionSegundos;

    public Integer getDuracionSegundos() { return duracionSegundos; }
    public void setDuracionSegundos(Integer duracionSegundos) { this.duracionSegundos = duracionSegundos; }
}
