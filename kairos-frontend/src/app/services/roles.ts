import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

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
  eliminar(id: number, nombre: string): void {
    if (confirm(`¿Está seguro de eliminar el rol "${nombre}"?`)) {
      this.http.delete(`${this.baseUrl}/${id}`).subscribe({
        next: () => {
          alert(`Rol "${nombre}" eliminado con éxito.`);
          this.cargarRoles(); // Recargar lista
        },
        error: (err) => alert(`Error al eliminar rol: ${err.error?.error || 'Error desconocido'}`)
      });
    }
  }
}

