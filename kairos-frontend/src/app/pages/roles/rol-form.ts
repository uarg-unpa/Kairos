import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RolesService } from '../../services/roles';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-rol-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rol-form.html'
})
export class RolFormComponent {
  private router = inject(Router);
  private config = inject(ConfigService);
  private http = inject(HttpClient);
  private rolesService = inject(RolesService);

  titulo = 'Crear Rol';
  nombre = '';

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/roles';
  }

  guardar() {
    const body = { nombre: this.nombre };
    this.http.post(this.baseUrl, body).subscribe({
      next: () => {
        this.rolesService.cargarRoles();
        this.router.navigate(['/roles']);
      },
      error: (err) => console.error('Error creando rol', err)
    });
  }
}

