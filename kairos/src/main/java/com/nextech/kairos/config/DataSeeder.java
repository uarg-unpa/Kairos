package com.nextech.kairos.config;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.repository.EtapaRepository;
import com.nextech.kairos.repository.IteracionRepository;
import com.nextech.kairos.repository.ProyectoRepository;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ProyectoRepository proyectoRepository;
    private final EtapaRepository etapaRepository;
    private final IteracionRepository iteracionRepository;

    public DataSeeder(ProyectoRepository proyectoRepository,
                      EtapaRepository etapaRepository,
                      IteracionRepository iteracionRepository) {
        this.proyectoRepository = proyectoRepository;
        this.etapaRepository = etapaRepository;
        this.iteracionRepository = iteracionRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (etapaRepository.count() > 0 || iteracionRepository.count() > 0) {
            log.info("DataSeeder: datos existentes, no seeding");
            return;
        }

        log.info("DataSeeder: sembrando datos de ejemplo (Proyecto RUP Demo)");

        Proyecto proyecto = new Proyecto();
        proyecto.setNombre("Proyecto RUP Demo");
        proyecto.setEquipo("Equipo Kairos");
        proyecto.setEstado("en progreso");
        proyecto = proyectoRepository.save(proyecto);

        // Etapa: Inicio (sin iteraciones)
        Etapa inicio = new Etapa();
        inicio.setNombre("Inicio");
        inicio.setDescripcion("Definición de la visión del proyecto, análisis de viabilidad y establecimiento del alcance inicial");
        inicio.setEstado(com.nextech.kairos.model.EstadoEtapa.COMPLETADA);
        inicio.setResponsableNombre("Gonzalo Ulloa");
        inicio.setFechaInicio(LocalDate.of(2025, 8, 19));
        inicio.setFechaFin(LocalDate.of(2025, 9, 9));
        inicio.setProyecto(proyecto);
        inicio = etapaRepository.save(inicio);

        // Etapa: Elaboración + Iteraciones 1 y 2
        Etapa elaboracion = new Etapa();
        elaboracion.setNombre("Elaboración");
        elaboracion.setDescripcion("Análisis detallado de requisitos, diseño de arquitectura y mitigación de riesgos principales");
        elaboracion.setEstado(com.nextech.kairos.model.EstadoEtapa.EN_PROGRESO);
        elaboracion.setResponsableNombre("Gonzalo Ulloa");
        elaboracion.setFechaInicio(LocalDate.of(2025, 9, 10));
        elaboracion.setFechaFin(LocalDate.of(2025, 10, 10));
        elaboracion.setProyecto(proyecto);
        elaboracion = etapaRepository.save(elaboracion);

        Iteracion elab1 = new Iteracion();
        elab1.setNumero(1);
        elab1.setFechaInicio(LocalDate.of(2025, 9, 10));
        elab1.setFechaFin(LocalDate.of(2025, 9, 23));
        elab1.setEtapa(elaboracion);
        iteracionRepository.save(elab1);

        Iteracion elab2 = new Iteracion();
        elab2.setNumero(2);
        elab2.setFechaInicio(LocalDate.of(2025, 9, 24));
        elab2.setFechaFin(LocalDate.of(2025, 10, 10));
        elab2.setEtapa(elaboracion);
        iteracionRepository.save(elab2);

        // Etapa: Construcción + Iteraciones 1, 2 y 3
        Etapa construccion = new Etapa();
        construccion.setNombre("Construcción");
        construccion.setDescripcion("Implementación y pruebas incrementales del producto");
        construccion.setEstado(com.nextech.kairos.model.EstadoEtapa.PENDIENTE);
        construccion.setResponsableNombre("Gonzalo Ulloa");
        construccion.setFechaInicio(LocalDate.of(2025, 10, 11));
        construccion.setFechaFin(LocalDate.of(2025, 11, 14));
        construccion.setProyecto(proyecto);
        construccion = etapaRepository.save(construccion);

        Iteracion cons1 = new Iteracion();
        cons1.setNumero(1);
        cons1.setFechaInicio(LocalDate.of(2025, 10, 11));
        cons1.setFechaFin(LocalDate.of(2025, 10, 29));
        cons1.setEtapa(construccion);
        iteracionRepository.save(cons1);

        Iteracion cons2 = new Iteracion();
        cons2.setNumero(2);
        cons2.setFechaInicio(LocalDate.of(2025, 10, 29));
        cons2.setFechaFin(LocalDate.of(2025, 11, 7));
        cons2.setEtapa(construccion);
        iteracionRepository.save(cons2);

        Iteracion cons3 = new Iteracion();
        cons3.setNumero(3);
        cons3.setFechaInicio(LocalDate.of(2025, 11, 8));
        cons3.setFechaFin(LocalDate.of(2025, 11, 14));
        cons3.setEtapa(construccion);
        iteracionRepository.save(cons3);

        // NO sembramos "Cierre Cursada" para que lo agregues manualmente
        log.info("DataSeeder: datos de ejemplo creados");
    }
}
