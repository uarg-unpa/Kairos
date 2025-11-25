import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios';
import { ProyectoService } from '../../services/proyecto.service';
import { AuthService } from '../../services/auth.service';
import { IdCoderService } from '../../services/id-coder.service';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuarios';
import { Proyecto } from '../../models/proyecto.model';
import { Observable } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-usuario-ver',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ver.html'
})
export class UsuarioVerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(UsuariosService);
  private authService = inject(AuthService);
  private proyectoService = inject(ProyectoService);
  private idCoderService = inject(IdCoderService);
  private alertService = inject(AlertService);

  usuario?: Usuario;
  usuarioEdit: { nombre: string; email: string } = { nombre: '', email: '' };
  proyectos: Proyecto[] = [];
  rolPrincipal: string | null = null;

  //banderas de control
  isEditing = false;
  esAdmin = false;
  esUsuarioActual = false;
  errorMensaje: string | null = null;
  loading = true;

  ngOnInit(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    this.esAdmin = this.authService.esAdmin();
    this.rolPrincipal = this.authService.usuario?.rol || 'MIEMBRO';

    this.route.queryParamMap.subscribe(params => {
      console.log(params.get('mode'));
      if (params.get('mode') === 'edit') {
        this.isEditing = true;
      }
    });

    if (encodedId) {
      const idDecodificado = this.idCoderService.decode(encodedId);
      if (idDecodificado) {
        this.cargarUsuario(idDecodificado);
        this.cargarProyectos(idDecodificado);
      } else {
        this.alertService.error('Error', 'Acceso denegado o ID de usuario inválido.');
        this.router.navigate(['/inicio']);
      }
    }
  }

  private cargarUsuario(id: number): void {
    this.service.getById(id).subscribe({
      next: (u: Usuario) => {
        this.loading = false;
        this.usuario = u;
        this.usuarioEdit = { nombre: u.nombre, email: u.email };
        this.esUsuarioActual = this.authService.usuario?.id === u.id;
        if (!this.esAdmin && !this.esUsuarioActual) {
          this.alertService.error('Acceso denegado', 'Acceso no autorizado a este perfil.');
          this.router.navigate(['/inicio']);
        }
      },
      error: (e: any) => {
        this.loading = false;
        console.error('No se pudo cargar el usuario', e);
        this.alertService.error('Error', 'Usuario no encontrado.');
        this.router.navigate(['/inicio']);
      }
    });
  }

  private cargarProyectos(idUsuario: number): void {
    const obs: Observable<Proyecto[]> = this.proyectoService.getProjectsByUser(idUsuario);

    obs.subscribe({
      next: (proyectos: Proyecto[]) => (this.proyectos = proyectos || []),
      error: (err: any) => console.error('Error al cargar proyectos del usuario:', err)
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMensaje = null;
    if (!this.isEditing && this.usuario) {
      this.usuarioEdit = { nombre: this.usuario.nombre, email: this.usuario.email };
    }
  }

  guardar(): void {
    if (!this.usuario) return;
    this.errorMensaje = null;

    // Validación simple de campos
    if (!this.usuarioEdit.nombre.trim() || !this.usuarioEdit.email.trim()) {
      this.errorMensaje = 'Nombre y Email son obligatorios.';
      return;
    }

    this.service.update(this.usuario.id, {
      nombre: this.usuarioEdit.nombre.trim(),
      email: this.usuarioEdit.email.trim()
    }).subscribe({
      // Tipar 'u' explícitamente como el objeto de respuesta
      next: (u: any) => {
        this.alertService.success('Éxito', 'Usuario actualizado con éxito.');
        // Actualizar el modelo local, tipando correctamente las propiedades
        this.usuario = { ...this.usuario!, nombre: u.nombre, email: u.email };
        this.toggleEdit();
      },
      error: (err: any) => {
        this.errorMensaje = err.error?.error || 'No se pudo actualizar el usuario. Verifica el email.';
        console.error('No se pudo actualizar el usuario', err);
      }
    });
  }

  // Método para obtener el ID codificado (necesario si se usa en el HTML)
  getEncodedId(id: number): string {
    return this.idCoderService.encode(id);
  }
}