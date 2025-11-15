import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';
import { UsuariosService } from '../../../services/usuarios.service';
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

  constructor(
    private route: ActivatedRoute,
    public proyectoService: ProyectoService,
    private authService: AuthService,
    private usuariosService: UsuariosService
  ) { }

  ngOnInit(): void {
    this.proyectoId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarMiembros();
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
          usuario: { id: m.idUsuario, nombre: m.nombre, email: m.email } // opcional
        }));
      },
      error: (err) => {
        console.error('Error al cargar miembros', err);
        this.miembros = [];
      }
    });
  }

  private cargarRolEnProyecto(): void {
    this.authService.currentUser$.subscribe(user => {
      const rolRaw = user?.rol || 'Miembro';
      this.rolEnProyecto = rolRaw.toUpperCase() === 'ADMINISTRADOR' ? 'Admin' : 'Líder';
    });
  }

  abrirModalAgregar(): void {
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

  abrirModalEditar(miembro: any): void {
    this.usuarioEdit = { ...miembro };
    this.rolEdit = miembro.rolProyecto;
    this.esLiderActual = this.authService.currentUser$ === miembro.idUsuario
      && miembro.rolProyecto?.toLowerCase().includes('líder');

    this.mostrarModalEditar = true;
  }

  us(): boolean {
    return this.authService.currentUser$ === this.usuarioEdit.idUsuario;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.errorMensaje = null;
  }

  actualizarRol(): void {
    this.proyectoService.actualizarRolMiembro(this.proyectoId!, this.usuarioEdit.idUsuario, this.rolEdit).subscribe({
      next: () => {
        alert('Rol actualizado');
        this.cerrarModalEditar();
        this.cargarMiembros();
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