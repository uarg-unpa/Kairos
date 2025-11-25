import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { AlertService } from './alert.service';

export interface Permiso {
  id: number;
  nombre: string;
}

export interface RolItem {
  id: number;
  nombre: string;
  permisos: Permiso[];
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private alertService = inject(AlertService);
  private baseUrl = (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/roles';

  roles = signal<RolItem[]>([]);

  constructor() {
    this.cargarRoles();
  }

  cargarRoles() {
    this.http.get<RolItem[]>(this.baseUrl).subscribe({
      next: (data) => this.roles.set(data || []),
      error: (err) => console.error('Error al cargar roles', err)
    });
  }

  async eliminar(id: number, nombre: string): Promise<void> {
    const confirmed = await this.alertService.confirm('¿Estás seguro?', `¿Está seguro de eliminar el rol "${nombre}"?`);
    if (confirmed) {
      this.http.delete(`${this.baseUrl}/${id}`).subscribe({
        next: () => {
          this.alertService.success('Éxito', `Rol "${nombre}" eliminado con éxito.`);
          this.cargarRoles(); // Recargar lista
        },
        error: (err) => this.alertService.error('Error', `Error al eliminar rol: ${err.error?.error || 'Error desconocido'}`)
      });
    }
  }
}
