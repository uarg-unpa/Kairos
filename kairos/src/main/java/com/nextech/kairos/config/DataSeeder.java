package com.nextech.kairos.config;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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

@Component
@Order(3)
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
        Rol rolUsuarioComun = createOrGetRol(Constants.ROLE_USER);

        if (etapaRepository.count() > 0) {
            log.info("DataSeeder: datos existentes detectados, verificando Kairos y MetricFlow SQA...");
            checkAndSeedKairosIfOldOrMissing(rolUsuarioComun);
            checkAndSeedMetricFlowIfOldOrMissing();
            return;
        }

        log.info("DataSeeder: inicializando datos reales del sistema Kairos y MetricFlow SQA...");
        seedKairosFromJson(rolUsuarioComun);
        createMetricFlowProject(rolUsuarioComun);
        log.info("DataSeeder: datos sembrados exitosamente.");
    }

    private Rol createOrGetRol(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseGet(() -> rolRepository.save(new Rol(nombre)));
    }

    private void seedKairosFromJson(Rol rolUsuarioComun) {
        try (InputStream is = new ClassPathResource("data/kairos_nextech_data.json").getInputStream()) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(is);
            JsonNode proyectosNode = root.get("proyectos");

            if (proyectosNode == null || !proyectosNode.isArray() || proyectosNode.isEmpty()) {
                log.warn("DataSeeder: el JSON no contiene proyectos para cargar.");
                return;
            }

            JsonNode pNode = proyectosNode.get(0);

            String nombreProyecto = pNode.get("nombre").asText();
            Proyecto proyecto = proyectoRepository.findByNombre(nombreProyecto).orElseGet(Proyecto::new);
            proyecto.setNombre(nombreProyecto);
            proyecto.setEquipo(pNode.get("equipo").asText());
            if (pNode.hasNonNull("descripcion")) {
                proyecto.setDescripcion(pNode.get("descripcion").asText());
            }
            proyecto.setEstado(pNode.get("estado").asText());
            if (pNode.hasNonNull("logo")) {
                proyecto.setLogo(pNode.get("logo").asText());
            }
            proyecto.setFechaInicio(LocalDate.of(2025, 8, 19));
            proyecto.setFechaFin(LocalDate.of(2026, 12, 18));
            proyecto = proyectoRepository.save(proyecto);

            Map<String, Usuario> usuarioMap = new HashMap<>();
            JsonNode usuariosNode = pNode.get("usuarios");
            if (usuariosNode != null && usuariosNode.isArray()) {
                for (JsonNode uNode : usuariosNode) {
                    String nombre = uNode.get("nombre").asText();
                    String email = uNode.get("email").asText();
                    String rolProyecto = uNode.get("rolProyecto").asText();

                    Usuario usuario = createUser(nombre, email, rolUsuarioComun);
                    createUsuarioProyecto(usuario, proyecto, rolProyecto);
                    usuarioMap.put(email, usuario);
                }
            }

            Map<String, Categoria> categoriaMap = createCategorias(proyecto, pNode.get("categorias"));

            JsonNode etapasNode = pNode.get("etapas");
            int totalTareas = 0;
            int totalTiempos = 0;
            int totalComentarios = 0;

            if (etapasNode != null && etapasNode.isArray()) {
                for (JsonNode eNode : etapasNode) {
                    String etapaNombre = eNode.get("nombre").asText();
                    String etapaDesc = eNode.hasNonNull("descripcion") ? eNode.get("descripcion").asText() : "";
                    EstadoEtapa etapaEstado = EstadoEtapa.valueOf(eNode.get("estado").asText().toUpperCase());
                    LocalDate etapaInicio = LocalDate.parse(eNode.get("fechaInicio").asText());
                    LocalDate etapaFin = LocalDate.parse(eNode.get("fechaFin").asText());

                    Etapa etapa = createEtapa(etapaNombre, etapaDesc, etapaEstado, proyecto, etapaInicio, etapaFin);

                    JsonNode itersNode = eNode.get("iteraciones");
                    if (itersNode != null && itersNode.isArray()) {
                        for (JsonNode iterNode : itersNode) {
                            int numero = iterNode.get("numero").asInt();
                            LocalDate iterInicio = LocalDate.parse(iterNode.get("fechaInicio").asText());
                            LocalDate iterFin = LocalDate.parse(iterNode.get("fechaFin").asText());

                            Iteracion iteracion = createIteracion(numero, etapa, iterInicio, iterFin);
                            if (numero == 99) {
                                iteracion.setDescripcion("Fuera de planificación");
                                iteracion = iteracionRepository.save(iteracion);
                            } else if (iterNode.hasNonNull("descripcion")) {
                                iteracion.setDescripcion(iterNode.get("descripcion").asText());
                                iteracion = iteracionRepository.save(iteracion);
                            }

                            JsonNode tareasNode = iterNode.get("tareas");
                            if (tareasNode != null && tareasNode.isArray()) {
                                for (JsonNode tNode : tareasNode) {
                                    String respEmail = tNode.get("responsableEmail").asText();
                                    Usuario responsable = usuarioMap.get(respEmail);

                                    String catNombre = tNode.get("categoria").asText();
                                    Categoria categoria = categoriaMap.get(catNombre);

                                    Tarea tarea = new Tarea();
                                    tarea.setNombre(tNode.get("nombre").asText());
                                    if (tNode.hasNonNull("descripcion")) {
                                        tarea.setDescripcion(tNode.get("descripcion").asText());
                                    }
                                    tarea.setIteracion(iteracion);
                                    tarea.setUsuario(responsable);
                                    tarea.setFechaCreacion(LocalDate.parse(tNode.get("fechaCreacion").asText()));
                                    tarea.setFechaFin(LocalDate.parse(tNode.get("fechaFin").asText()));
                                    tarea.setHorasEstimadas(tNode.hasNonNull("horasEstimadas") ? tNode.get("horasEstimadas").asDouble() : 0.0);
                                    tarea.setEstado(tNode.get("estado").asText());
                                    tarea.setPrioridad("Media");
                                    if ("Completado".equalsIgnoreCase(tarea.getEstado())) {
                                        tarea.setFechaCompletada(tarea.getFechaFin());
                                    }

                                    if (categoria != null) {
                                        Set<Categoria> cats = new HashSet<>();
                                        cats.add(categoria);
                                        tarea.setCategorias(cats);
                                    }

                                    tarea = tareaRepository.save(tarea);
                                    totalTareas++;

                                    JsonNode tiemposNode = tNode.get("tiempos");
                                    if (tiemposNode != null && tiemposNode.isArray()) {
                                        for (JsonNode timeNode : tiemposNode) {
                                            String timeEmail = timeNode.get("usuarioEmail").asText();
                                            Usuario timeUser = usuarioMap.getOrDefault(timeEmail, responsable);

                                            Tiempo tiempo = new Tiempo();
                                            tiempo.setTarea(tarea);
                                            tiempo.setUsuario(timeUser);
                                            tiempo.setDuracion(timeNode.get("duracionMinutos").asInt());
                                            tiempo.setFechaRegistro(LocalDate.parse(timeNode.get("fechaRegistro").asText()));
                                            if (timeNode.hasNonNull("descripcion")) {
                                                tiempo.setDescripcion(timeNode.get("descripcion").asText());
                                            }
                                            tiempoRepository.save(tiempo);
                                            totalTiempos++;
                                        }
                                    }

                                    JsonNode comentariosNode = tNode.get("comentarios");
                                    if (comentariosNode != null && comentariosNode.isArray()) {
                                        for (JsonNode comNode : comentariosNode) {
                                            String comEmail = comNode.get("usuarioEmail").asText();
                                            Usuario comUser = usuarioMap.getOrDefault(comEmail, responsable);

                                            Comentario comentario = new Comentario();
                                            comentario.setTarea(tarea);
                                            comentario.setUsuario(comUser);
                                            comentario.setContenido(comNode.get("contenido").asText());
                                            comentario.setFechaComentario(LocalDate.parse(comNode.get("fechaComentario").asText()));
                                            comentarioRepository.save(comentario);
                                            totalComentarios++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            log.info("DataSeeder: proyecto '{}' sembrado exitosamente ({} tareas, {} registros de tiempo, {} comentarios).",
                    proyecto.getNombre(), totalTareas, totalTiempos, totalComentarios);

        } catch (Exception e) {
            log.error("DataSeeder: error al sembrar datos reales de Kairos desde JSON: {}", e.getMessage(), e);
            throw new RuntimeException("Error al sembrar datos reales de Kairos", e);
        }
    }

    private void checkAndSeedKairosIfOldOrMissing(Rol rolUsuarioComun) {
        Optional<Proyecto> kairosOpt = proyectoRepository.findByNombre("Kairos");
        if (kairosOpt.isEmpty()) {
            seedKairosFromJson(rolUsuarioComun);
            return;
        }

        Proyecto proyecto = kairosOpt.get();
        List<Etapa> etapas = etapaRepository.findByProyecto_IdProyecto(proyecto.getIdProyecto());
        boolean hasTransicion = etapas.stream().anyMatch(e -> "Transición".equalsIgnoreCase(e.getNombre()));
        if (hasTransicion) {
            log.info("DataSeeder: Kairos ya cuenta con datos reales de NexTech.");
            return;
        }

        log.info("DataSeeder: actualizando Kairos con datos reales de NexTech...");
        for (Etapa e : etapas) {
            etapaRepository.delete(e);
        }
        etapaRepository.flush();

        List<Categoria> viejasCategorias = categoriaRepository.findByProyectoIdProyecto(proyecto.getIdProyecto());
        categoriaRepository.deleteAll(viejasCategorias);
        categoriaRepository.flush();

        seedKairosFromJson(rolUsuarioComun);
        log.info("DataSeeder: Kairos actualizado exitosamente con datos reales de NexTech.");
    }

    private void createMetricFlowProject(Rol rolUsuarioComun) {
        Proyecto proyecto = new Proyecto();
        proyecto.setNombre("MetricFlow SQA");
        proyecto.setEquipo("CoDevIT");
        proyecto.setDescripcion("Sistema de análisis y gestión de métricas de calidad");
        proyecto.setEstado("Completado");
        proyecto.setFechaInicio(LocalDate.of(2025, 8, 22));
        proyecto.setFechaFin(LocalDate.of(2026, 2, 6));
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

        seedMetricFlowFromData(proyecto, Arrays.asList(ezequiel, fabricio, santiago, lorenzo, malcolm));
    }

    private void checkAndSeedMetricFlowIfOldOrMissing() {
        Optional<Proyecto> metricOpt = proyectoRepository.findByNombre("MetricFlow SQA");
        if (metricOpt.isEmpty()) {
            return;
        }
        Proyecto proyecto = metricOpt.get();
        List<Etapa> etapas = etapaRepository.findByProyecto_IdProyecto(proyecto.getIdProyecto());
        boolean hasTransicion = etapas.stream().anyMatch(e -> "Transición".equalsIgnoreCase(e.getNombre()));
        if (hasTransicion) {
            log.info("DataSeeder: MetricFlow SQA ya cuenta con datos reales de Codevit.");
            return;
        }

        log.info("DataSeeder: actualizando MetricFlow SQA con datos reales de Codevit...");
        for (Etapa e : etapas) {
            etapaRepository.delete(e);
        }
        etapaRepository.flush();

        List<Categoria> viejasCategorias = categoriaRepository.findByProyectoIdProyecto(proyecto.getIdProyecto());
        categoriaRepository.deleteAll(viejasCategorias);
        categoriaRepository.flush();

        Usuario ezequiel = usuarioRepository.findByEmail("ezequiel.mansilla@gmail.com").orElse(null);
        Usuario fabricio = usuarioRepository.findByEmail("fabricio.nunez@gmail.com").orElse(null);
        Usuario santiago = usuarioRepository.findByEmail("santiago.pacheco@gmail.com").orElse(null);
        Usuario lorenzo = usuarioRepository.findByEmail("lorenzo.teppa@gmail.com").orElse(null);
        Usuario malcolm = usuarioRepository.findByEmail("malcolm.salazar@gmail.com").orElse(null);

        List<Usuario> usuarios = new java.util.ArrayList<>();
        if (ezequiel != null) usuarios.add(ezequiel);
        if (fabricio != null) usuarios.add(fabricio);
        if (santiago != null) usuarios.add(santiago);
        if (lorenzo != null) usuarios.add(lorenzo);
        if (malcolm != null) usuarios.add(malcolm);

        seedMetricFlowFromData(proyecto, usuarios);
        if (proyecto.getFechaInicio() == null) {
            proyecto.setFechaInicio(LocalDate.of(2025, 8, 22));
        }
        proyecto.setFechaFin(LocalDate.of(2026, 2, 6));
        proyecto.setEstado("Completado");
        proyectoRepository.save(proyecto);
        log.info("DataSeeder: MetricFlow SQA actualizado exitosamente con datos reales de Codevit.");
    }

    private void seedMetricFlowFromData(Proyecto proyecto, List<Usuario> usuarios) {
        try (InputStream is = new ClassPathResource("data/metricflow_codevit_data.json").getInputStream()) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(is);

            Map<String, Usuario> usuarioMap = new HashMap<>();
            for (Usuario u : usuarios) {
                usuarioMap.put(u.getEmail(), u);
            }

            Map<String, Categoria> categoriaMap = new HashMap<>();
            JsonNode categoriasNode = root.get("categorias");
            if (categoriasNode != null && categoriasNode.isArray()) {
                for (JsonNode catNode : categoriasNode) {
                    String catNombre = catNode.asText();
                    Categoria cat = new Categoria();
                    cat.setNombre(catNombre);
                    cat.setProyecto(proyecto);
                    cat = categoriaRepository.save(cat);
                    categoriaMap.put(catNombre, cat);
                }
            }

            Map<String, Iteracion> iteracionMap = new HashMap<>();
            JsonNode etapasNode = root.get("etapas");
            if (etapasNode != null && etapasNode.isArray()) {
                for (JsonNode eNode : etapasNode) {
                    String etapaNombre = eNode.get("nombre").asText();
                    String etapaDesc = eNode.has("descripcion") ? eNode.get("descripcion").asText() : "";
                    EstadoEtapa etapaEstado = EstadoEtapa.valueOf(eNode.get("estado").asText().toUpperCase());
                    LocalDate fechaInicio = LocalDate.parse(eNode.get("fechaInicio").asText());
                    LocalDate fechaFin = LocalDate.parse(eNode.get("fechaFin").asText());

                    Etapa etapa = createEtapa(etapaNombre, etapaDesc, etapaEstado, proyecto, fechaInicio, fechaFin);

                    JsonNode itersNode = eNode.get("iteraciones");
                    if (itersNode != null && itersNode.isArray()) {
                        for (JsonNode iterNode : itersNode) {
                            int iterNum = iterNode.get("numero").asInt();
                            LocalDate iterInicio = LocalDate.parse(iterNode.get("fechaInicio").asText());
                            LocalDate iterFin = LocalDate.parse(iterNode.get("fechaFin").asText());

                            Iteracion iteracion = createIteracion(iterNum, etapa, iterInicio, iterFin);
                            if (iterNode.has("descripcion")) {
                                iteracion.setDescripcion(iterNode.get("descripcion").asText());
                                iteracion = iteracionRepository.save(iteracion);
                            }
                            iteracionMap.put(etapaNombre + "_" + iterNum, iteracion);
                        }
                    }
                }
            }

            JsonNode tareasNode = root.get("tareas");
            if (tareasNode != null && tareasNode.isArray()) {
                for (JsonNode tNode : tareasNode) {
                    String etapaNombre = tNode.get("etapa").asText();
                    int iterNum = tNode.get("iteracionNumero").asInt();
                    Iteracion iteracion = iteracionMap.get(etapaNombre + "_" + iterNum);

                    String userEmail = tNode.get("userEmail").asText();
                    Usuario usuario = usuarioMap.get(userEmail);

                    String catNombre = tNode.get("categoria").asText();
                    Categoria categoria = categoriaMap.get(catNombre);

                    Tarea tarea = new Tarea();
                    tarea.setNombre(tNode.get("nombre").asText());
                    if (tNode.has("descripcion")) {
                        tarea.setDescripcion(tNode.get("descripcion").asText());
                    }
                    tarea.setIteracion(iteracion);
                    tarea.setUsuario(usuario);
                    tarea.setFechaCreacion(LocalDate.parse(tNode.get("fechaInicio").asText()));
                    tarea.setFechaFin(LocalDate.parse(tNode.get("fechaFin").asText()));
                    tarea.setHorasEstimadas(tNode.get("horasEstimadas").asDouble());
                    tarea.setEstado(tNode.get("estado").asText());
                    tarea.setPrioridad(tNode.get("prioridad").asText());
                    if ("Completado".equalsIgnoreCase(tarea.getEstado())) {
                        tarea.setFechaCompletada(tarea.getFechaFin());
                    }

                    if (categoria != null) {
                        Set<Categoria> cats = new HashSet<>();
                        cats.add(categoria);
                        tarea.setCategorias(cats);
                    }

                    tarea = tareaRepository.save(tarea);

                    JsonNode tiemposNode = tNode.get("tiempos");
                    if (tiemposNode != null && tiemposNode.isArray()) {
                        for (JsonNode timeNode : tiemposNode) {
                            Tiempo tiempo = new Tiempo();
                            tiempo.setTarea(tarea);
                            tiempo.setUsuario(usuario);
                            tiempo.setDuracion(timeNode.get("duracion").asInt());
                            tiempo.setFechaRegistro(LocalDate.parse(timeNode.get("fechaRegistro").asText()));
                            if (timeNode.has("descripcion")) {
                                String desc = timeNode.get("descripcion").asText();
                                tiempo.setDescripcion(desc);
                                if (!desc.startsWith("Registro de tiempo")) {
                                    Comentario com = new Comentario();
                                    com.setTarea(tarea);
                                    com.setUsuario(usuario);
                                    com.setContenido(desc);
                                    com.setFechaComentario(tiempo.getFechaRegistro());
                                    comentarioRepository.save(com);
                                }
                            }
                            tiempoRepository.save(tiempo);
                        }
                    }
                }
            }

            log.info("DataSeeder: MetricFlow SQA sembrado exitosamente con datos reales de Codevit ({} tareas)",
                    tareasNode != null ? tareasNode.size() : 0);

        } catch (Exception e) {
            log.error("Error al sembrar datos reales de MetricFlow SQA desde JSON: {}", e.getMessage(), e);
            throw new RuntimeException("Error al cargar datos reales de MetricFlow SQA", e);
        }
    }

    private Usuario createUser(String nombre, String email, Rol rolUsuarioComun) {
        Usuario user = usuarioRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new Usuario(nombre, email);
            user.addRol(rolUsuarioComun);
            return usuarioRepository.save(user);
        }
        if (user.getRoles() == null || user.getRoles().stream().noneMatch(r -> r.getNombre().equals(rolUsuarioComun.getNombre()))) {
            user.addRol(rolUsuarioComun);
            user = usuarioRepository.save(user);
        }
        return user;
    }

    private UsuarioProyecto createUsuarioProyecto(Usuario usuario, Proyecto proyecto, String rolProyecto) {
        Optional<UsuarioProyecto> existing = usuarioProyectoRepository
                .findByUsuario_IdAndProyecto_IdProyecto(usuario.getId(), proyecto.getIdProyecto());
        if (existing.isPresent()) {
            UsuarioProyecto up = existing.get();
            up.setRolProyecto(rolProyecto);
            return usuarioProyectoRepository.save(up);
        }
        UsuarioProyecto up = new UsuarioProyecto(usuario, proyecto, rolProyecto);
        return usuarioProyectoRepository.save(up);
    }

    private Map<String, Categoria> createCategorias(Proyecto proyecto, JsonNode categoriasNode) {
        List<String> categoriasNombres = new java.util.ArrayList<>();
        if (categoriasNode != null && categoriasNode.isArray() && !categoriasNode.isEmpty()) {
            for (JsonNode cNode : categoriasNode) {
                categoriasNombres.add(cNode.asText());
            }
        } else {
            categoriasNombres.addAll(Arrays.asList(
                "Análisis",
                "Diseño",
                "Codificación",
                "Validación y Verificación",
                "Documentación",
                "Actividades Externas"
            ));
        }

        Map<String, Categoria> categoriaMap = new HashMap<>();
        for (String nombre : categoriasNombres) {
            Categoria cat = new Categoria();
            cat.setNombre(nombre);
            cat.setProyecto(proyecto);
            categoriaMap.put(nombre, categoriaRepository.save(cat));
        }
        return categoriaMap;
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
}
