import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PermisosService } from '../../services/permisos';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-permiso-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './permiso-form.html' // Usaremos este nombre
})
export class PermisoFormComponent {
  private router = inject(Router);
  private config = inject(ConfigService);
  private http = inject(HttpClient);
  private permisosService = inject(PermisosService);

  titulo = 'Crear Permiso';
  nombre = '';

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/permisos';
  }

  guardar() {
    const body = { nombre: this.nombre };
    this.http.post(this.baseUrl, body).subscribe({
      next: () => {
        this.permisosService.cargarPermisos();
        this.router.navigate(['/permisos']);
      },
      error: (err) => alert(`Error creando permiso: ${err.error?.error || 'Error desconocido'}`)
    });
  }
}