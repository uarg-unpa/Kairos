package com.nextech.kairos.config;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import com.nextech.kairos.model.Categoria;
import com.nextech.kairos.model.Comentario;
import com.nextech.kairos.model.EstadoEtapa;
import com.nextech.kairos.model.Etapa;
import com.nextech.kairos.model.Iteracion;
import com.nextech.kairos.model.Proyecto;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Tarea;
import com.nextech.kairos.model.Tiempo;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.model.UsuarioProyecto;
import com.nextech.kairos.repository.CategoriaRepository;
import com.nextech.kairos.repository.ComentarioRepository;
import com.nextech.kairos.repository.EtapaRepository;
import com.nextech.kairos.repository.IteracionRepository;
import com.nextech.kairos.repository.ProyectoRepository;
import com.nextech.kairos.repository.RolRepository;
import com.nextech.kairos.repository.TareaRepository;
import com.nextech.kairos.repository.TiempoRepository;
import com.nextech.kairos.repository.UsuarioProyectoRepository;
import com.nextech.kairos.repository.UsuarioRepository;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ProyectoRepository proyectoRepository;
    private final EtapaRepository etapaRepository;
    private final IteracionRepository iteracionRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final CategoriaRepository categoriaRepository;
    private final TareaRepository tareaRepository;
    private final TiempoRepository tiempoRepository;
    private final ComentarioRepository comentarioRepository;
    private final UsuarioProyectoRepository usuarioProyectoRepository;

    public DataSeeder(
            ProyectoRepository proyectoRepository,
            EtapaRepository etapaRepository,
            IteracionRepository iteracionRepository,
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            CategoriaRepository categoriaRepository,
            TareaRepository tareaRepository,
            TiempoRepository tiempoRepository,
            ComentarioRepository comentarioRepository,
            UsuarioProyectoRepository usuarioProyectoRepository) {
        this.proyectoRepository = proyectoRepository;
        this.etapaRepository = etapaRepository;
        this.iteracionRepository = iteracionRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.categoriaRepository = categoriaRepository;
        this.tareaRepository = tareaRepository;
        this.tiempoRepository = tiempoRepository;
        this.comentarioRepository = comentarioRepository;
        this.usuarioProyectoRepository = usuarioProyectoRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (etapaRepository.count() > 0) {
            log.info("DataSeeder: datos existentes, no seeding");
            return;
        }

        log.info("DataSeeder: sembrando datos de ejemplo completos del sistema Kairos");

        Rol rolUsuarioComun = createOrGetRol("Usuario Común");

        createAllProjects(rolUsuarioComun);

        log.info("DataSeeder: datos de ejemplo creados exitosamente");
    }

    private Rol createOrGetRol(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseGet(() -> rolRepository.save(new Rol(nombre)));
    }

    private void createAllProjects(Rol rolUsuarioComun) {
        //1: Kairos (NexTech)
        createKairosProject(rolUsuarioComun);
        //2: GRCU Manager (4 Bytes)
        createGRCUManagerProject(rolUsuarioComun);

        //3: MetricFlow SQA (CoDevIT)
        createMetricFlowProject(rolUsuarioComun);

        //4: Vesta Risk Manager (T-Code)
        createVestaRiskProject(rolUsuarioComun);

        //5-8:proyectos inventados
        createInventedProjects(rolUsuarioComun);
    }

    private void createKairosProject(Rol rolUsuarioComun) {
        Proyecto proyecto = new Proyecto();
        proyecto.setNombre("Kairos");
        proyecto.setEquipo("NexTech");
        proyecto.setDescripcion("Sistema de planificación de proyectos, registro de tiempos y visualización del avance");
        proyecto.setEstado("En Progreso");
        proyecto.setLogo("Kairos Logo.png");
        proyecto = proyectoRepository.save(proyecto);

        Usuario gonzalo = createUser("Gonzalo Ulloa", "gonzaloalejandrou@gmail.com", rolUsuarioComun);
        Usuario guillermo = createUser("Guillermo Escalante", "guilleh114@gmail.com", rolUsuarioComun);
        Usuario valeria = createUser("Valeria Centurión", "centurionvaleria6@gmail.com", rolUsuarioComun);
        Usuario agustina = createUser("Agustina Maldonado", "agus0.0maldonado@gmail.com", rolUsuarioComun);
        Usuario florencia = createUser("Florencia Mendez", "esstefaniamendez@gmail.com", rolUsuarioComun);

        createUsuarioProyecto(gonzalo, proyecto, "Líder");
        createUsuarioProyecto(guillermo, proyecto, "Analista");
        createUsuarioProyecto(valeria, proyecto, "Programador");
        createUsuarioProyecto(agustina, proyecto, "Documentador");
        createUsuarioProyecto(florencia, proyecto, "Gerente de Calidad");

        Set<Categoria> categorias = createCategorias(proyecto);

        createStagesAndIterations(proyecto, categorias, Arrays.asList(gonzalo, guillermo, valeria, agustina, florencia));
    }

    private void createGRCUManagerProject(Rol rolUsuarioComun) {
        Proyecto proyecto = new Proyecto();
        proyecto.setNombre("GRCU Manager");
        proyecto.setEquipo("4 Bytes");
        proyecto.setDescripcion("Sistema de gestión de requerimientos y casos de uso");
        proyecto.setEstado("En Progreso");
        proyecto = proyectoRepository.save(proyecto);

        Usuario cristian = createUser("Cristian Carranza", "cristian.carranza@gmail.com", rolUsuarioComun);
        Usuario abril = createUser("Abril Alvarez", "abril.alvarez@gmail.com", rolUsuarioComun);
        Usuario martina = createUser("Martina Gagna", "martina.gagna@gmail.com", rolUsuarioComun);
        Usuario nicolas = createUser("Nicolas Butterfield", "nicolas.butterfield@gmail.com", rolUsuarioComun);

        createUsuarioProyecto(cristian, proyecto, "Líder");
        createUsuarioProyecto(abril, proyecto, "Documentador");
        createUsuarioProyecto(martina, proyecto, "Gerente de Calidad");
        createUsuarioProyecto(nicolas, proyecto, "Programador");

        Set<Categoria> categorias = createCategorias(proyecto);
        createStagesAndIterations(proyecto, categorias, Arrays.asList(cristian, abril, martina, nicolas));
    }

    private void createMetricFlowProject(Rol rolUsuarioComun) {
        Proyecto proyecto = new Proyecto();
        proyecto.setNombre("MetricFlow SQA");
        proyecto.setEquipo("CoDevIT");
        proyecto.setDescripcion("Sistema de análisis y gestión de métricas de calidad");
        proyecto.setEstado("En Progreso");
        proyecto = proyectoRepository.save(proyecto);

        Usuario ezequiel = createUser("Ezequiel Mansilla", "ezequiel.mansilla@gmail.com", rolUsuarioComun);
        Usuario fabricio = createUser("Fabricio Nuñez", "fabricio.nunez@gmail.com", rolUsuarioComun);
        Usuario santiago = createUser("Santiago Pacheco", "santiago.pacheco@gmail.com", rolUsuarioComun);
        Usuario lorenzo = createUser("Lorenzo Teppa", "lorenzo.teppa@gmail.com", rolUsuarioComun);
        Usuario malcolm = createUser("Malcolm Salazar", "malcolm.salazar@gmail.com", rolUsuarioComun);

        createUsuarioProyecto(ezequiel, proyecto, "Líder");
        createUsuarioProyecto(fabricio, proyecto, "Gerente de Calidad");
        createUsuarioProyecto(santiago, proyecto, "Analista");
        createUsuarioProyecto(lorenzo, proyecto, "Programador");
        createUsuarioProyecto(malcolm, proyecto, "Documentador");

        Set<Categoria> categorias = createCategorias(proyecto);
        createStagesAndIterations(proyecto, categorias, Arrays.asList(ezequiel, fabricio, santiago, lorenzo, malcolm));
    }

    private void createVestaRiskProject(Rol rolUsuarioComun) {
        Proyecto proyecto = new Proyecto();
        proyecto.setNombre("Vesta Risk Manager");
        proyecto.setEquipo("T-Code");
        proyecto.setDescripcion("Sistema de gestión y análisis de riesgos");
        proyecto.setEstado("Completado");
        proyecto = proyectoRepository.save(proyecto);

        Usuario agustin = createUser("Agustín Collareda", "agustin.collareda@gmail.com", rolUsuarioComun);
        Usuario hugo = createUser("Hugo Frey", "hugo.frey@gmail.com", rolUsuarioComun);
        Usuario cinthia = createUser("Cinthia Hernandez", "cinthia.hernandez@gmail.com", rolUsuarioComun);

        createUsuarioProyecto(agustin, proyecto, "Líder");
        createUsuarioProyecto(hugo, proyecto, "Programador");
        createUsuarioProyecto(cinthia, proyecto, "Analista");

        Set<Categoria> categorias = createCategorias(proyecto);
        createStagesAndIterations(proyecto, categorias, Arrays.asList(agustin, hugo, cinthia));
    }

    private void createInventedProjects(Rol rolUsuarioComun) {
        String[][] projectsData = {
            {"DataFlow Pro", "InnovateTech", "Plataforma de flujo de datos en tiempo real"},
            {"SecureVault", "CyberGuard", "Sistema de gestión de seguridad y criptografía"},
            {"CloudSync Manager", "SkyTech", "Gestor de sincronización en la nube"},
            {"Analytics Hub", "DataInsights", "Centro de análisis e inteligencia de datos"}
        };

        for (String[] data : projectsData) {
            Proyecto proyecto = new Proyecto();
            proyecto.setNombre(data[0]);
            proyecto.setEquipo(data[1]);
            proyecto.setDescripcion(data[2]);
            proyecto.setEstado("En Progreso");
            proyecto = proyectoRepository.save(proyecto);

            int userCount = 4 + (int)(Math.random() * 2);
            java.util.List<Usuario> usuarios = new java.util.ArrayList<>();
            for (int i = 0; i < userCount; i++) {
                Usuario user = createUser("User " + data[1] + " " + (i + 1), 
                    "user" + i + "@" + data[1].toLowerCase() + ".com", rolUsuarioComun);
                usuarios.add(user);
            }

            String[] roles = {"Líder", "Programador", "Analista", "Documentador", "Gerente de Calidad"};
            for (int i = 0; i < usuarios.size(); i++) {
                createUsuarioProyecto(usuarios.get(i), proyecto, roles[i % roles.length]);
            }

            Set<Categoria> categorias = createCategorias(proyecto);
            createStagesAndIterations(proyecto, categorias, usuarios);
        }
    }

    private Usuario createUser(String nombre, String email, Rol rolUsuarioComun) {
        return usuarioRepository.findByEmail(email).orElseGet(() -> {
            Usuario user = new Usuario(nombre, email);
            user.addRol(rolUsuarioComun);
            return usuarioRepository.save(user);
        });
    }

    private UsuarioProyecto createUsuarioProyecto(Usuario usuario, Proyecto proyecto, String rolProyecto) {
        UsuarioProyecto up = new UsuarioProyecto(usuario, proyecto, rolProyecto);
        return usuarioProyectoRepository.save(up);
    }

    private Set<Categoria> createCategorias(Proyecto proyecto) {
        String[] categoriasNombres = {
            "Análisis", "Diseño", "Codificación", "Validación y Verificación", 
            "Documentación", "Actividades Externas"
        };
        Set<Categoria> categorias = new HashSet<>();
        for (String nombre : categoriasNombres) {
            Categoria cat = new Categoria();
            cat.setNombre(nombre);
            cat.setProyecto(proyecto);
            categorias.add(categoriaRepository.save(cat));
        }
        return categorias;
    }

    private void createStagesAndIterations(Proyecto proyecto, Set<Categoria> categorias, java.util.List<Usuario> usuarios) {
        Etapa inicio = createEtapa("Inicio", 
            "Definición de la visión del proyecto y análisis de viabilidad",
            EstadoEtapa.COMPLETADA, proyecto, LocalDate.of(2025, 8, 1), LocalDate.of(2025, 9, 4));
        
        Iteracion inicioIter = createIteracion(1, inicio, LocalDate.of(2025, 8, 1), LocalDate.of(2025, 9, 4));
        createTareasInicio(inicioIter, categorias, usuarios);
        Etapa elaboracion = createEtapa("Elaboración",
            "Análisis detallado de requisitos y diseño de arquitectura",
            EstadoEtapa.EN_PROGRESO, proyecto, LocalDate.of(2025, 9, 5), LocalDate.of(2025, 10, 10));
        
        Iteracion elab1 = createIteracion(1, elaboracion, LocalDate.of(2025, 9, 5), LocalDate.of(2025, 9, 23));
        createTareasElaboracion1(elab1, categorias, usuarios);

        Iteracion elab2 = createIteracion(2, elaboracion, LocalDate.of(2025, 9, 24), LocalDate.of(2025, 10, 10));
        createTareasElaboracion2(elab2, categorias, usuarios);

        Etapa construccion = createEtapa("Construcción",
            "Implementación y pruebas incrementales del producto",
            EstadoEtapa.PENDIENTE, proyecto, LocalDate.of(2025, 10, 13), LocalDate.of(2025, 11, 18));
        
        Iteracion cons1 = createIteracion(1, construccion, LocalDate.of(2025, 10, 13), LocalDate.of(2025, 10, 28));
        createTareasConstraccion1(cons1, categorias, usuarios);

        Iteracion cons2 = createIteracion(2, construccion, LocalDate.of(2025, 10, 29), LocalDate.of(2025, 11, 7));
        createTareasConstraccion2(cons2, categorias, usuarios);

        Iteracion cons3 = createIteracion(3, construccion, LocalDate.of(2025, 11, 8), LocalDate.of(2025, 11, 18));
        createTareasConstraccion3(cons3, categorias, usuarios);
    }

    private Etapa createEtapa(String nombre, String descripcion, EstadoEtapa estado, 
                              Proyecto proyecto, LocalDate fechaInicio, LocalDate fechaFin) {
        Etapa etapa = new Etapa();
        etapa.setNombre(nombre);
        etapa.setDescripcion(descripcion);
        etapa.setEstado(estado);
        etapa.setProyecto(proyecto);
        etapa.setResponsableNombre(proyecto.getEquipo());
        etapa.setFechaInicio(fechaInicio);
        etapa.setFechaFin(fechaFin);
        return etapaRepository.save(etapa);
    }

    private Iteracion createIteracion(Integer numero, Etapa etapa, LocalDate fechaInicio, LocalDate fechaFin) {
        Iteracion iteracion = new Iteracion();
        iteracion.setNumero(numero);
        iteracion.setEtapa(etapa);
        iteracion.setFechaInicio(fechaInicio);
        iteracion.setFechaFin(fechaFin);
        return iteracionRepository.save(iteracion);
    }

    private Tarea createTarea(String nombre, Iteracion iteracion, Usuario usuario, 
                              LocalDate fechaInicio, LocalDate fechaFin, 
                              Set<Categoria> categorias, Categoria categoriaPrimaria,
                              double horasEstimadas, String estado) {
        Tarea tarea = new Tarea();
        tarea.setNombre(nombre);
        tarea.setIteracion(iteracion);
        tarea.setUsuario(usuario);
        tarea.setFechaCreacion(fechaInicio);
        tarea.setFechaFin(fechaFin);
        tarea.setEstado(estado);
        tarea.setPrioridad("Media");
        tarea.setHorasEstimadas(horasEstimadas);
        if (categoriaPrimaria != null) {
            Set<Categoria> cats = new HashSet<>();
            cats.add(categoriaPrimaria);
            tarea.setCategorias(cats);
        }
        return tareaRepository.save(tarea);
    }

    private void createTareasInicio(Iteracion iteracion, Set<Categoria> categorias, java.util.List<Usuario> usuarios) {
        java.util.List<Categoria> catList = new java.util.ArrayList<>(categorias);
        java.util.List<String> tareasNombres = Arrays.asList(
            "Entrevista con clientes",
            "Estándar de documentación",
            "Resumen de entrevista",
            "Estudio de factibilidad",
            "Modelo de Negocio",
            "Plan de SQA",
            "Plan de Proyecto",
            "Plan de Gestión de Configuración",
            "Propuesta de Desarrollo",
            "Plan de Iteración E1",
            "Implementación de UARGFlow"
        );

        LocalDate inicio = iteracion.getFechaInicio();
        LocalDate fin = iteracion.getFechaFin();

        for (int i = 0; i < tareasNombres.size(); i++) {
            Usuario responsable = usuarios.get(i % usuarios.size());
            Categoria cat = catList.get(i % catList.size());
            LocalDate tFin = inicio.plusDays(2 + i);
            if (tFin.isAfter(fin)) tFin = fin;

            Tarea tarea = createTarea(tareasNombres.get(i), iteracion, responsable, 
                inicio.plusDays(i), tFin, categorias, cat, 2.0 + (i * 0.5), "Completado");
            
            addTimeRecords(tarea, responsable, inicio.plusDays(i), 1 + (i % 3));
            
            if (i % 3 == 0) {
                addCommentToTask(tarea, usuarios.get((i + 1) % usuarios.size()), inicio.plusDays(i));
            }
        }
    }

    private void createTareasElaboracion1(Iteracion iteracion, Set<Categoria> categorias, java.util.List<Usuario> usuarios) {
        java.util.List<Categoria> catList = new java.util.ArrayList<>(categorias);
        java.util.List<String> tareasNombres = Arrays.asList(
            "Plan de Estimación",
            "Estimación 1",
            "Plan de Gestión de Riesgos",
            "Identificación de primeros riesgos",
            "Herramientas y Tecnologías a utilizar",
            "Especificación de Requerimientos",
            "Plan de SQA finalizado",
            "Diagrama de Casos de Uso",
            "Cierre de iteración E1",
            "Plan de iteración E2"
        );

        LocalDate inicio = iteracion.getFechaInicio();
        LocalDate fin = iteracion.getFechaFin();

        for (int i = 0; i < tareasNombres.size(); i++) {
            Usuario responsable = usuarios.get(i % usuarios.size());
            Categoria cat = catList.get(i % catList.size());
            LocalDate tFin = inicio.plusDays(1 + i);
            if (tFin.isAfter(fin)) tFin = fin;

            Tarea tarea = createTarea(tareasNombres.get(i), iteracion, responsable,
                inicio.plusDays(i), tFin, categorias, cat, 3.0 + (i * 0.8), "Completado");
            
            addTimeRecords(tarea, responsable, inicio.plusDays(i), 2 + (i % 2));
            
            if (i % 4 == 1) {
                addCommentToTask(tarea, usuarios.get((i + 2) % usuarios.size()), inicio.plusDays(i));
            }
        }
    }

    private void createTareasElaboracion2(Iteracion iteracion, Set<Categoria> categorias, java.util.List<Usuario> usuarios) {
        java.util.List<Categoria> catList = new java.util.ArrayList<>(categorias);
        java.util.List<String> tareasNombres = Arrays.asList(
            "Estimación 2",
            "Identificación y evaluación de Riesgos",
            "Modelo de Casos de Uso",
            "Revisión de Modelo de Casos de Uso",
            "Primer prototipo funcional",
            "Modelo de Datos",
            "Inicio de Modelo de Diseño",
            "Plan de pruebas",
            "Pruebas de Implementación de UARGFlow",
            "Cierre de iteracion E2",
            "Plan de Iteración C1"
        );

        LocalDate inicio = iteracion.getFechaInicio();
        LocalDate fin = iteracion.getFechaFin();

        for (int i = 0; i < tareasNombres.size(); i++) {
            Usuario responsable = usuarios.get(i % usuarios.size());
            Categoria cat = catList.get(i % catList.size());
            LocalDate tFin = inicio.plusDays(1 + i);
            if (tFin.isAfter(fin)) tFin = fin;

            double horas = "Primer prototipo funcional".equals(tareasNombres.get(i)) ? 8.0 : 3.5 + (i * 0.6);
            Tarea tarea = createTarea(tareasNombres.get(i), iteracion, responsable,
                inicio.plusDays(i), tFin, categorias, cat, horas, "Completado");
            
            addTimeRecords(tarea, responsable, inicio.plusDays(i), 2 + (i % 3));
            
            if (i % 3 == 2) {
                addCommentToTask(tarea, usuarios.get((i + 3) % usuarios.size()), inicio.plusDays(i));
            }
        }
    }

    private void createTareasConstraccion1(Iteracion iteracion, Set<Categoria> categorias, java.util.List<Usuario> usuarios) {
        java.util.List<Categoria> catList = new java.util.ArrayList<>(categorias);
        java.util.List<String> tareasNombres = Arrays.asList(
            "Estimación 3",
            "Evaluación de Riesgos",
            "Modelo Arquitectónico",
            "Revisión de Modelo Arquitectónico",
            "Modelo de diseño finalizado",
            "Revisión de modelo de diseño",
            "Definición de 1ra tanda de casos de uso",
            "Especificación de Casos de uso a implementar",
            "Revisión Técnica de Especificación",
            "Implementación del modelo de datos en SQL",
            "Definición de Casos de Prueba",
            "CU: Crear Proyecto",
            "CU: Gestionar Usuarios",
            "CU: Asignar Recursos",
            "Ejecución de Casos de prueba",
            "Cierre de iteración C1",
            "Plan de Iteración C2"
        );

        LocalDate inicio = iteracion.getFechaInicio();
        LocalDate fin = iteracion.getFechaFin();

        for (int i = 0; i < tareasNombres.size(); i++) {
            Usuario responsable = usuarios.get(i % usuarios.size());
            Categoria cat = catList.get(i % catList.size());
            LocalDate tFin = inicio.plusDays(1 + i);
            if (tFin.isAfter(fin)) tFin = fin;

            boolean isCodingTask = tareasNombres.get(i).startsWith("CU:") || 
                                   tareasNombres.get(i).contains("Implementación");
            double horas = isCodingTask ? 6.0 + (Math.random() * 4) : 3.0 + (i * 0.5);
            
            Tarea tarea = createTarea(tareasNombres.get(i), iteracion, responsable,
                inicio.plusDays(i), tFin, categorias, cat, horas, "Completado");
            
            addTimeRecords(tarea, responsable, inicio.plusDays(i), isCodingTask ? 3 + (i % 3) : 2);
            
            if (i % 3 == 0) {
                addCommentToTask(tarea, usuarios.get((i + 1) % usuarios.size()), inicio.plusDays(i));
            }
        }
    }

    private void createTareasConstraccion2(Iteracion iteracion, Set<Categoria> categorias, java.util.List<Usuario> usuarios) {
        java.util.List<Categoria> catList = new java.util.ArrayList<>(categorias);
        java.util.List<String> tareasNombres = Arrays.asList(
            "Estimación 4",
            "Evaluación de Riesgos",
            "Priorización de segunda tanda de CU",
            "Definición de pruebas para CU",
            "Especificación de Casos de Uso a implementar",
            "CU: Reportes Avanzados",
            "CU: Panel de Control",
            "CU: Exportar Datos",
            "CU: Integración API",
            "Ejecución de Casos de prueba",
            "Cierre de iteración C2",
            "Plan de Iteración C3"
        );

        LocalDate inicio = iteracion.getFechaInicio();
        LocalDate fin = iteracion.getFechaFin();

        for (int i = 0; i < tareasNombres.size(); i++) {
            Usuario responsable = usuarios.get(i % usuarios.size());
            Categoria cat = catList.get(i % catList.size());
            LocalDate tFin = inicio.plusDays(1 + i);
            if (tFin.isAfter(fin)) tFin = fin;

            boolean isCodingTask = tareasNombres.get(i).startsWith("CU:");
            double horas = isCodingTask ? 5.0 + (Math.random() * 5) : 2.5 + (i * 0.6);
            
            Tarea tarea = createTarea(tareasNombres.get(i), iteracion, responsable,
                inicio.plusDays(i), tFin, categorias, cat, horas, "Completado");
            
            addTimeRecords(tarea, responsable, inicio.plusDays(i), isCodingTask ? 2 + (i % 3) : 1 + (i % 2));
            
            if (i % 4 == 1) {
                addCommentToTask(tarea, usuarios.get((i + 2) % usuarios.size()), inicio.plusDays(i));
            }
        }
    }

    private void createTareasConstraccion3(Iteracion iteracion, Set<Categoria> categorias, java.util.List<Usuario> usuarios) {
        java.util.List<Categoria> catList = new java.util.ArrayList<>(categorias);
        java.util.List<String> tareasNombres = Arrays.asList(
            "Estimación 5",
            "Evaluación de Riesgos",
            "Definición de casos de uso a implementar",
            "Definición de casos de prueba para casos de uso",
            "Especificación de casos de uso a implementar",
            "CU: Auditoría del Sistema",
            "CU: Gestión de Permisos",
            "CU: Búsqueda Avanzada",
            "CU: Notificaciones en Tiempo Real",
            "Ejecución de casos de prueba",
            "Cierre de Iteración C3"
        );

        LocalDate inicio = iteracion.getFechaInicio();
        LocalDate fin = iteracion.getFechaFin();

        for (int i = 0; i < tareasNombres.size(); i++) {
            Usuario responsable = usuarios.get(i % usuarios.size());
            Categoria cat = catList.get(i % catList.size());
            LocalDate tFin = inicio.plusDays(1 + i);
            if (tFin.isAfter(fin)) tFin = fin;

            boolean isCodingTask = tareasNombres.get(i).startsWith("CU:");
            double horas = isCodingTask ? 4.0 + (Math.random() * 6) : 2.0 + (i * 0.7);
            
            Tarea tarea = createTarea(tareasNombres.get(i), iteracion, responsable,
                inicio.plusDays(i), tFin, categorias, cat, horas, "En Progreso");
            
            addTimeRecords(tarea, responsable, inicio.plusDays(i), isCodingTask ? 2 + (i % 3) : 1);
            
            if (i % 3 == 1) {
                addCommentToTask(tarea, usuarios.get((i + 1) % usuarios.size()), inicio.plusDays(i));
            }
        }
    }

    private void addTimeRecords(Tarea tarea, Usuario usuario, LocalDate fechaBase, int numRecords) {
        java.util.List<String> comentariosActividad = Arrays.asList(
            "Avance significativo",
            "En progreso",
            "Revisión completada",
            "Pruebas iniciadas",
            "Integración exitosa"
        );

        for (int i = 0; i < numRecords; i++) {
            Tiempo tiempo = new Tiempo();
            tiempo.setTarea(tarea);
            tiempo.setUsuario(usuario);
            tiempo.setDuracion(30 + (int)(Math.random() * 240));
            tiempo.setFechaRegistro(fechaBase.plusDays(i));
            tiempoRepository.save(tiempo);
        }
    }

    private void addCommentToTask(Tarea tarea, Usuario usuario, LocalDate fechaBase) {
        java.util.List<String> comentarios = Arrays.asList(
            "Necesita revisión de especificaciones",
            "Completado exitosamente",
            "Requiere ajustes menores",
            "Bloqueado por otra tarea",
            "Aprobado por el equipo de QA",
            "Pendiente de validación",
            "Documentación faltante"
        );

        Comentario comentario = new Comentario();
        comentario.setTarea(tarea);
        comentario.setUsuario(usuario);
        comentario.setContenido(comentarios.get((int)(Math.random() * comentarios.size())));
        comentario.setFechaComentario(fechaBase);
        comentarioRepository.save(comentario);
    }
}
