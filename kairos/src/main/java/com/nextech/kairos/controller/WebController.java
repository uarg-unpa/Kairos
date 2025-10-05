package com.nextech.kairos.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.nextech.kairos.model.Permiso;
import com.nextech.kairos.model.Rol;
import com.nextech.kairos.model.Usuario;
import com.nextech.kairos.security.PermissionRequired;
import com.nextech.kairos.service.AuthService;
import com.nextech.kairos.service.PermisoService;
import com.nextech.kairos.service.RolService;
import com.nextech.kairos.service.UsuarioService;
import com.nextech.kairos.util.SessionHelper;

import jakarta.servlet.http.HttpSession;

@Controller
public class WebController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private RolService rolService;

    @Autowired
    private PermisoService permisoService;

    @Autowired
    private AuthService authService;

    @Autowired
    private SessionHelper sessionHelper;

    @GetMapping("/")
    public String index(HttpSession session) {
        if (sessionHelper.isLoggedIn(session)) {
            return "redirect:/usuarios";
        }
        return "index";
    }

    @PostMapping("/login/google")
    public String processGoogleLogin(@RequestParam String email,
                                   @RequestParam String name,
                                   HttpSession session,
                                   RedirectAttributes redirectAttributes) {
        try {
            Usuario usuario = authService.processGoogleLogin(email, name);
            sessionHelper.setUsuarioInSession(session, usuario);
            return "redirect:/usuarios";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al procesar el login: " + e.getMessage());
            return "redirect:/";
        }
    }

    @GetMapping("/salir")
    public String logout(HttpSession session) {
        sessionHelper.clearSession(session);
        return "salir";
    }

    @GetMapping("/usuarios")
    public String usuarios(Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        List<Usuario> usuarios = usuarioService.findAll();
        model.addAttribute("usuarios", usuarios);
        return "usuarios";
    }

    @GetMapping("/usuario/crear")
    public String usuarioCrear(Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        List<Rol> roles = rolService.findAll();
        model.addAttribute("roles", roles);
        return "usuario-crear";
    }

    @PostMapping("/usuario/crear")
    public String usuarioCrearProcesar(@RequestParam String nombre,
                                     @RequestParam String email,
                                     @RequestParam(required = false) List<Long> roles,
                                     RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            usuarioService.createUsuario(nombre, email, roles);
            redirectAttributes.addFlashAttribute("success", "Usuario creado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al crear usuario: " + e.getMessage());
        }
        return "redirect:/usuarios";
    }

    @GetMapping("/usuario/ver/{id}")
    public String usuarioVer(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Usuario> usuario = usuarioService.findById(id);
        if (usuario.isPresent()) {
            model.addAttribute("usuario", usuario.get());
            return "usuario-ver";
        }
        return "redirect:/usuarios";
    }

    @GetMapping("/usuario/modificar/{id}")
    public String usuarioModificar(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Usuario> usuario = usuarioService.findById(id);
        List<Rol> roles = rolService.findAll();
        if (usuario.isPresent()) {
            model.addAttribute("usuario", usuario.get());
            model.addAttribute("roles", roles);
            return "usuario-modificar";
        }
        return "redirect:/usuarios";
    }

    @PostMapping("/usuario/modificar/{id}")
    public String usuarioModificarProcesar(@PathVariable Long id,
                                         @RequestParam String nombre,
                                         @RequestParam String email,
                                         @RequestParam(required = false) List<Long> roles,
                                         RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            usuarioService.updateUsuario(id, nombre, email, roles);
            redirectAttributes.addFlashAttribute("success", "Usuario modificado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al modificar usuario: " + e.getMessage());
        }
        return "redirect:/usuarios";
    }

    @GetMapping("/usuario/eliminar/{id}")
    public String usuarioEliminar(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Usuario> usuario = usuarioService.findById(id);
        if (usuario.isPresent()) {
            model.addAttribute("usuario", usuario.get());
            return "usuario-eliminar";
        }
        return "redirect:/usuarios";
    }

    @PostMapping("/usuario/eliminar/{id}")
    public String usuarioEliminarProcesar(@PathVariable Long id, RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            usuarioService.deleteUsuario(id);
            redirectAttributes.addFlashAttribute("success", "Usuario eliminado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al eliminar usuario: " + e.getMessage());
        }
        return "redirect:/usuarios";
    }
    @GetMapping("/roles")
    public String roles(Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        List<Rol> roles = rolService.findAll();
        model.addAttribute("roles", roles);
        return "roles";
    }

    @GetMapping("/rol/crear")
    @PermissionRequired("Roles")
    public String rolCrear(Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        List<Permiso> permisos = permisoService.findAll();
        model.addAttribute("permisos", permisos);
        return "rol-crear";
    }

    @PostMapping("/rol/crear")
    @PermissionRequired("Roles")
    public String rolCrearProcesar(@RequestParam String nombre,
                                 @RequestParam(required = false) List<Long> permisos,
                                 RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            rolService.createRol(nombre, permisos);
            redirectAttributes.addFlashAttribute("success", "Rol creado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al crear rol: " + e.getMessage());
        }
        return "redirect:/roles";
    }

    @GetMapping("/rol/ver/{id}")
    @PermissionRequired("Roles")
    public String rolVer(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Rol> rol = rolService.findById(id);
        if (rol.isPresent()) {
            model.addAttribute("rol", rol.get());
            return "rol-ver";
        }
        return "redirect:/roles";
    }

    @GetMapping("/rol/modificar/{id}")
    @PermissionRequired("Roles")
    public String rolModificar(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Rol> rol = rolService.findById(id);
        List<Permiso> permisos = permisoService.findAll();
        if (rol.isPresent()) {
            model.addAttribute("rol", rol.get());
            model.addAttribute("permisos", permisos);
            return "rol-modificar";
        }
        return "redirect:/roles";
    }

    @PostMapping("/rol/modificar/{id}")
    @PermissionRequired("Roles")
    public String rolModificarProcesar(@PathVariable Long id,
                                     @RequestParam String nombre,
                                     @RequestParam(required = false) List<Long> permisos,
                                     RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            rolService.updateRol(id, nombre, permisos);
            redirectAttributes.addFlashAttribute("success", "Rol modificado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al modificar rol: " + e.getMessage());
        }
        return "redirect:/roles";
    }

    @GetMapping("/rol/eliminar/{id}")
    @PermissionRequired("Roles")
    public String rolEliminar(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Rol> rol = rolService.findById(id);
        if (rol.isPresent()) {
            model.addAttribute("rol", rol.get());
            return "rol-eliminar";
        }
        return "redirect:/roles";
    }

    @PostMapping("/rol/eliminar/{id}")
    @PermissionRequired("Roles")
    public String rolEliminarProcesar(@PathVariable Long id, RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            rolService.deleteRol(id);
            redirectAttributes.addFlashAttribute("success", "Rol eliminado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al eliminar rol: " + e.getMessage());
        }
        return "redirect:/roles";
    }

    @GetMapping("/permisos")
    @PermissionRequired("Permisos")
    public String permisos(Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        List<Permiso> permisos = permisoService.findAll();
        model.addAttribute("permisos", permisos);
        return "permisos";
    }

    @GetMapping("/permiso/crear")
    @PermissionRequired("Permisos")
    public String permisoCrear(HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        return "permiso-crear";
    }

    @PostMapping("/permiso/crear")
    @PermissionRequired("Permisos")
    public String permisoCrearProcesar(@RequestParam String nombre, RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            permisoService.createPermiso(nombre);
            redirectAttributes.addFlashAttribute("success", "Permiso creado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al crear permiso: " + e.getMessage());
        }
        return "redirect:/permisos";
    }

    @GetMapping("/permiso/ver/{id}")
    @PermissionRequired("Permisos")
    public String permisoVer(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Permiso> permiso = permisoService.findById(id);
        if (permiso.isPresent()) {
            model.addAttribute("permiso", permiso.get());
            return "permiso-ver";
        }
        return "redirect:/permisos";
    }

    @GetMapping("/permiso/modificar/{id}")
    @PermissionRequired("Permisos")
    public String permisoModificar(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Permiso> permiso = permisoService.findById(id);
        if (permiso.isPresent()) {
            model.addAttribute("permiso", permiso.get());
            return "permiso-modificar";
        }
        return "redirect:/permisos";
    }

    @PostMapping("/permiso/modificar/{id}")
    @PermissionRequired("Permisos")
    public String permisoModificarProcesar(@PathVariable Long id,
                                         @RequestParam String nombre,
                                         RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            permisoService.updatePermiso(id, nombre);
            redirectAttributes.addFlashAttribute("success", "Permiso modificado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al modificar permiso: " + e.getMessage());
        }
        return "redirect:/permisos";
    }

    @GetMapping("/permiso/eliminar/{id}")
    @PermissionRequired("Permisos")
    public String permisoEliminar(@PathVariable Long id, Model model, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        Optional<Permiso> permiso = permisoService.findById(id);
        if (permiso.isPresent()) {
            model.addAttribute("permiso", permiso.get());
            return "permiso-eliminar";
        }
        return "redirect:/permisos";
    }

    @PostMapping("/permiso/eliminar/{id}")
    @PermissionRequired("Permisos")
    public String permisoEliminarProcesar(@PathVariable Long id, RedirectAttributes redirectAttributes, HttpSession session) {
        if (!sessionHelper.isLoggedIn(session)) {
            return "redirect:/";
        }
        try {
            permisoService.deletePermiso(id);
            redirectAttributes.addFlashAttribute("success", "Permiso eliminado exitosamente");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al eliminar permiso: " + e.getMessage());
        }
        return "redirect:/permisos";
    }
}
