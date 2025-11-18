import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { IdCoderService } from '../../../services/id-coder.service'
// import { Proyecto } from '../../../models/proyecto.model';

@Component({
  selector: 'app-miembros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './miembros.component.html',
  styleUrls: ['./miembros.component.css']
})
export class MiembrosComponent implements OnInit {
  proyectoId: number | null = null;
  miembros: Array<{
    idUsuario: number;
    nombre: string;
    email: string;
    rolProyecto: string;
    horas: number;
    progreso: number;
    status: string;
    usuario: any;
  }> = [];
  rolEnProyecto: 'Admin' | 'Líder' | 'Miembro' = 'Miembro';
  mostrarModalAgregar = false;
  mostrarModalEditar = false;
  usuariosBusqueda: any[] = [];
  usuarioEdit: any = {};
  rolEdit: string = '';
  searchQuery: string = '';
  newEmail: string = '';
  newRol: string = 'Miembro';
  errorMensaje: string | null = null;
  esLiderActual: boolean = false;
  selectedUsuarioId: number | null = null;
  currentUserId: number | null = null;
  miembrosLimiteAlcanzado: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router, // << Inyección para manejo de errores
    private idCoderService: IdCoderService,
    public proyectoService: ProyectoService,
    private authService: AuthService,
    private usuariosService: UsuariosService
  ) { }

  ngOnInit(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');

    if (encodedId) {
      const id = this.idCoderService.decode(encodedId);

      if (id) {
        this.proyectoId = id;
        this.cargarMiembros();
      } else {
        alert('Acceso denegado o ID de proyecto inválido.');
        this.router.navigate(['/inicio']);
        return;
      }
    } else {
      alert('ID de proyecto faltante.');
      this.router.navigate(['/inicio']);
      return;
    }

    this.cargarRolEnProyecto();
  }

  private cargarMiembros(): void {
  this.proyectoService.getMiembros(this.proyectoId!).subscribe({
    next: (miembros: any[]) => {

      this.miembros = miembros.map(m => ({
        idUsuario: m.idUsuario,
        nombre: m.nombre || 'Sin nombre',
        email: m.email || 'Sin email',
        rolProyecto: m.rolProyecto || 'Miembro',
        horas: 0,
        progreso: 0,
        status: 'offline',
        usuario: { id: m.idUsuario, nombre: m.nombre, email: m.email }
      }));
      this.miembrosLimiteAlcanzado = this.miembros.length >= 6;
      if (this.authService.esAdmin()) {
          this.rolEnProyecto = 'Admin';
        }

      const miUsuario = miembros.find(m => m.idUsuario === this.currentUserId);

      if (miUsuario) {
        const rol = (miUsuario.rolProyecto || '').toLowerCase();

        if (rol.includes('líder') || rol.includes('lider')) {
          this.rolEnProyecto = 'Líder';
        } else {
          this.rolEnProyecto = 'Miembro';
        }
      }
    },
    error: (err) => {
      console.error('Error al cargar miembros', err);
      this.miembros = [];
    }
  });
}


private cargarRolEnProyecto(): void {
  this.authService.currentUser$.subscribe(user => {
    this.currentUserId = user?.id || null;

    // Primero: revisar rol global
    const rolGlobal = user?.rol; // "Administrador" o "Usuario Común"

    if (rolGlobal === "Administrador") {
      this.rolEnProyecto = "Admin";
      return;
    }

    // Si NO es admin → buscar su rol dentro del proyecto
    if (this.miembros.length > 0 && this.currentUserId) {
      const yo = this.miembros.find(m => m.idUsuario === this.currentUserId);

      if (yo && yo.rolProyecto?.toLowerCase() === "líder") {
        this.rolEnProyecto = "Líder";
      } else {
        this.rolEnProyecto = "Miembro";
      }
    }
  });
}



  abrirModalAgregar(): void {
    if (this.miembrosLimiteAlcanzado) {
      alert('Este proyecto ya alcanzó el límite de 6 miembros.');
      return;
    }
    this.mostrarModalAgregar = true;
    this.searchQuery = '';
    this.usuariosBusqueda = [];
  }

  cerrarModalAgregar(): void {
    this.mostrarModalAgregar = false;
    this.errorMensaje = null;
  }

  buscarUsuarios(): void {
    if (this.searchQuery.length < 2) {
      this.usuariosBusqueda = [];
      return;
    }

    this.usuariosService.searchByName(this.searchQuery).subscribe({
      next: (usuarios) => {
        this.usuariosBusqueda = usuarios.filter(u =>
          !this.miembros.some(m => m.email === u.email)
        );
      }
    });
  }

  agregarMiembro(): void {
    if (this.miembrosLimiteAlcanzado) {
      this.errorMensaje = 'No se pueden agregar más miembros. Límite: 6.';
      return;
    }
    if (!this.proyectoId) return;

    // Opción 1: Usuario seleccionado del buscador
    if (this.selectedUsuarioId) {
      this.proyectoService.agregarMiembro(this.proyectoId, this.selectedUsuarioId, this.newRol).subscribe({
        next: () => {
          alert('Miembro agregado');
          this.limpiarModal();
          this.cargarMiembros();
        },
        error: () => this.errorMensaje = 'Error al agregar miembro'
      });
    }
    // Opción 2: Invitación por email
    else if (this.newEmail.trim()) {
      this.proyectoService.invitarMiembro(this.proyectoId, this.newEmail, this.newRol).subscribe({
        next: () => {
          alert('Invitación enviada con éxito');
          this.limpiarModal();
          this.cargarMiembros();
        },
        error: (err) => {
          this.errorMensaje = err.error?.error || 'No se pudo enviar la invitación';
        }
      });
    }
    else {
      this.errorMensaje = 'Selecciona un usuario o ingresa un email';
    }
  }

  seleccionarUsuario(usuario: any): void {
    this.selectedUsuarioId = usuario.id;
    this.newEmail = usuario.email;
    this.usuariosBusqueda = [];
    this.searchQuery = usuario.nombre;
  }
  limiteMiembros(): boolean{
    return this.miembrosLimiteAlcanzado;
  }

  abrirModalEditar(miembro: any): void {
    if (this.esLider(miembro)) {
      return;
    }
    this.usuarioEdit = { ...miembro };
    this.rolEdit = miembro.rolProyecto;
    const esMiUsuario = this.currentUserId === miembro.idUsuario;
    this.esLiderActual = esMiUsuario && miembro.rolProyecto?.toLowerCase().includes('líder');
    this.mostrarModalEditar = true;
  }

  esLider(miembro: any): boolean {
    return this.currentUserId === miembro.idUsuario && this.rolEnProyecto?.toLowerCase().includes('líder')
  }

  us(): boolean {
    return this.currentUserId === this.usuarioEdit.idUsuario;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.errorMensaje = null;
  }

  actualizarRol(): void {
    const rol = this.rolEdit.trim();

    if (!rol) {
      this.errorMensaje = 'El rol no puede estar vacío.';
      return;
    }

    this.proyectoService.actualizarRolMiembro(
      this.proyectoId!,
      this.usuarioEdit.idUsuario,
      rol
    ).subscribe({
      next: () => {
        alert('Rol actualizado');
        this.cerrarModalEditar();
        this.cargarMiembros();
      },
      error: () => {
        this.errorMensaje = 'No se pudo actualizar el rol.';
      }
    });
  }


  limpiarModal(): void {
    this.selectedUsuarioId = null;
    this.newEmail = '';
    this.searchQuery = '';
    this.usuariosBusqueda = [];
    this.mostrarModalAgregar = false;
    this.errorMensaje = null;
  }
}