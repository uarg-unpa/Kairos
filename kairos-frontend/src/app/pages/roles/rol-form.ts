import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RolesService } from '../../services/roles';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { PermisosService } from '../../services/permisos';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-rol-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rol-form.html'
})
export class RolFormComponent {
  private router = inject(Router);
  private config = inject(ConfigService);
  private http = inject(HttpClient);
  private rolesService = inject(RolesService);
  private permisosService = inject(PermisosService);
  private alertService = inject(AlertService);

  titulo = 'Crear Rol';
  nombre = '';
  permisosSeleccionados: number[] = [];

  permisos = this.permisosService.permisos;

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/roles';
  }

  togglePermiso(idPermiso: number, checked: boolean): void {
    if (checked) {
      this.permisosSeleccionados.push(idPermiso);
    } else {
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== idPermiso);
    }
  }

  guardar() {
    if (!this.nombre || !this.nombre.trim()) {
      this.alertService.warning('Atención', 'El nombre del rol no puede estar vacío.');
      return;
    }

    const body = {
      nombre: this.nombre.trim(),
      permisosIds: this.permisosSeleccionados
    };

    this.http.post(this.baseUrl, body).subscribe({
      next: () => {
        this.alertService.success('Éxito', 'Rol creado exitosamente.');
        this.rolesService.cargarRoles();
        this.router.navigate(['/roles']);
      },
      error: (err) => {
        console.error('Error creando rol', err);
        this.alertService.error('Error', err.error?.message || err.error?.error || 'No se pudo crear el rol.');
      }
    });
  }
}
