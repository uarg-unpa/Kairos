import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { IdCoderService } from '../../../services/id-coder.service';
import { AlertService } from '../../../services/alert.service';
// import Swal from 'sweetalert2';

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
  maxRolLength: number = 20;
  private alertService = inject(AlertService);



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
        this.alertService.error('Acceso denegado o ID de proyecto inválido.');
        this.router.navigate(['/inicio']);
        return;
      }
    } else {
      this.alertService.error('ID de proyecto faltante.');
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
        if (this.authService.esAdmin()) {
          this.rolEnProyecto = 'Admin';
          return; // No sobrescribir el rol de Admin
        }

        // Solo para usuarios no-admin, verificar su rol en el proyecto
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

      // La asignación de rol se maneja completamente en cargarMiembros()
      // Este método solo obtiene el currentUserId para usarlo después
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
      const rolError = this.validarNewRol();
      if (rolError) {
        this.errorMensaje = rolError;
        return;
      }
      this.proyectoService.agregarMiembro(this.proyectoId, this.selectedUsuarioId, this.newRol).subscribe({
        next: () => {
          this.limpiarModal();
          this.alertService.success('Miembro agregado');
          this.cargarMiembros();
        },
        error: () => this.errorMensaje = 'Error al agregar miembro'
      });
    }
    // Opción 2: Invitación por email
    else if (this.newEmail.trim()) {
      const emailError = this.validarEmail();
      if (emailError) {
        this.errorMensaje = emailError;
        return;
      }
      const rolError = this.validarNewRol();
      if (rolError) {
        this.errorMensaje = rolError;
        return;
      }
      this.proyectoService.invitarMiembro(this.proyectoId, this.newEmail, this.newRol).subscribe({
        next: () => {
          this.limpiarModal();
          this.alertService.success('Invitación enviada con éxito');
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
  validarEmail(): string | null {
    const email = this.newEmail.trim();
    if (!email) return null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailRegex.test(email)) {
      return 'El formato del correo es inválido.';
    }
    return null;
  }

  validarNewRol(): string | null {
    const rol = this.newRol.trim();

    if (rol.length > this.maxRolLength) {
      return `Máximo ${this.maxRolLength} caracteres.`;
    }
    if (this.newEmail.trim() && !rol) {
      return 'El rol es obligatorio para invitaciones por email.';
    }
    return null;
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
        this.cerrarModalEditar();
        this.alertService.success('Rol actualizado');
        this.cargarMiembros();
      },
      error: () => {
        this.errorMensaje = 'No se pudo actualizar el rol.';
      }
    });
  }

  // eliminarMiembro(miembro: any): void {
  //   Swal.fire({
  //     title: '¿Confirmas la desvinculación?',
  //     text: `Estás a punto de eliminar a ${miembro.nombre} del proyecto. Sus métricas y tareas finalizadas se conservarán pero las tareas pendientes serán reasignadas automáticamente al Líder del proyecto.`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#6c757d',
  //     confirmButtonText: 'Sí, desvincular',
  //     cancelButtonText: 'Cancelar'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.proyectoService.eliminarMiembro(this.proyectoId!, miembro.idUsuario).subscribe({
  //         next: () => {
  //           this.alertService.success('Usuario desvinculado con éxito.');
  //           this.cargarMiembros();
  //         },
  //         error: (err) => {
  //           this.alertService.error('Error al desvincular: ' + (err.error?.error || err.message));
  //         }
  //       });
  //     }
  //   });
  // }


  limpiarModal(): void {
    this.selectedUsuarioId = null;
    this.newEmail = '';
    this.searchQuery = '';
    this.usuariosBusqueda = [];
    this.mostrarModalAgregar = false;
    this.errorMensaje = null;
  }

  async eliminarMiembro(miembro: any): Promise<void> {
    if (!this.proyectoId) return;

    // Confirmar eliminación con SweetAlert2
    const confirmado = await this.alertService.confirm(
      '¿Eliminar miembro?',
      `¿Estás seguro de que deseas eliminar a ${miembro.nombre} del proyecto?`,
      'Sí, eliminar'
    );

    if (!confirmado) {
      return;
    }

    this.proyectoService.eliminarMiembro(this.proyectoId, miembro.idUsuario).subscribe({
      next: () => {
        this.alertService.success('Miembro eliminado del proyecto');
        this.cargarMiembros();
      },
      error: (err) => {
        console.error('Error al eliminar miembro', err);
        this.alertService.error('No se pudo eliminar al miembro');
      }
    });
  }
}