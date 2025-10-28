package com.nextech.kairos.dto;

public class TiempoDetenerRequest {
    // opcional: segundos efectivos a registrar (descontando pausas)
    private Integer duracionSegundos;

    public Integer getDuracionSegundos() { return duracionSegundos; }
    public void setDuracionSegundos(Integer duracionSegundos) { this.duracionSegundos = duracionSegundos; }
}

