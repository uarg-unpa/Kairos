package com.nextech.kairos.config;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
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

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String JSON_PATH = "/data/kairos_nextech_data.json";

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
            log.info("DataSeeder: ya existen datos cargados en la base de datos.");
            return;
        }

        Rol rolUsuarioComun = createOrGetRol("Usuario Común");
        seedKairosFromJson(rolUsuarioComun);
    }

    private Rol createOrGetRol(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseGet(() -> rolRepository.save(new Rol(nombre)));
    }

    private void seedKairosFromJson(Rol rolUsuarioComun) {
        try (InputStream is = getClass().getResourceAsStream(JSON_PATH)) {
            if (is == null) {
                throw new IllegalStateException("No se encontró el archivo " + JSON_PATH + " en src/main/resources");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(is);
            JsonNode proyectosNode = root.get("proyectos");

            if (proyectosNode == null || !proyectosNode.isArray() || proyectosNode.isEmpty()) {
                log.warn("DataSeeder: el JSON no contiene proyectos para cargar.");
                return;
            }

            JsonNode pNode = proyectosNode.get(0);

            Proyecto proyecto = new Proyecto();
            proyecto.setNombre(pNode.get("nombre").asText());
            proyecto.setEquipo(pNode.get("equipo").asText());
            proyecto.setDescripcion(pNode.get("descripcion").asText());
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

            Map<String, Categoria> categoriaMap = createCategorias(proyecto);

            int totalTareas = 0;
            int totalTiempos = 0;
            int totalComentarios = 0;

            JsonNode etapasNode = pNode.get("etapas");
            if (etapasNode != null && etapasNode.isArray()) {
                for (JsonNode eNode : etapasNode) {
                    String etapaNombre = eNode.get("nombre").asText();
                    String etapaDesc = eNode.hasNonNull("descripcion") ? eNode.get("descripcion").asText() : "";
                    EstadoEtapa etapaEstado = EstadoEtapa.valueOf(eNode.get("estado").asText());
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
                                    tarea.setIteracion(iteracion);
                                    tarea.setUsuario(responsable);
                                    tarea.setFechaCreacion(LocalDate.parse(tNode.get("fechaCreacion").asText()));
                                    tarea.setFechaFin(LocalDate.parse(tNode.get("fechaFin").asText()));
                                    tarea.setHorasEstimadas(tNode.get("horasEstimadas").asDouble());
                                    tarea.setEstado(tNode.get("estado").asText());
                                    tarea.setPrioridad("Media");

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

            log.info("DataSeeder: proyecto '{}' cargado ({} tareas, {} registros de tiempo, {} comentarios).",
                    proyecto.getNombre(), totalTareas, totalTiempos, totalComentarios);

        } catch (Exception e) {
            log.error("DataSeeder: error al cargar {}: {}", JSON_PATH, e.getMessage(), e);
            throw new RuntimeException("Error al inicializar los datos del proyecto Kairos", e);
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

    private Map<String, Categoria> createCategorias(Proyecto proyecto) {
        String[] categoriasNombres = {
            "Análisis",
            "Diseño",
            "Codificación",
            "Validación y Verificación",
            "Documentación",
            "Actividades Externas"
        };
        Map<String, Categoria> categorias = new HashMap<>();
        for (String nombre : categoriasNombres) {
            Categoria cat = new Categoria();
            cat.setNombre(nombre);
            cat.setProyecto(proyecto);
            categorias.put(nombre, categoriaRepository.save(cat));
        }
        return categorias;
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
