// pages/roles/roles.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService, RolItem } from '../../services/roles';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './roles.html'
})
export class RolesComponent {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  public rolesService = inject(RolesService);

  // Acceso directo a la señal de roles
  roles = this.rolesService.roles;

  get baseUrl() {
    return (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/roles';
  }

  // Lógica de eliminación
  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el rol "${nombre}"?`)) {
      this.http.delete(`${this.baseUrl}/${id}`).subscribe({
        next: () => {
          alert(`Rol "${nombre}" eliminado con éxito.`);
          this.rolesService.cargarRoles(); // Recargar lista
        },
        error: (err) => alert(`Error al eliminar rol: ${err.error?.error || 'Error desconocido'}`)
      });
    }
  }
}