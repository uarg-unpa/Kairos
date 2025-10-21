import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

export interface RolItem {
  id: number;
  nombre: string;
  permisos: string[]; // viene como set de strings desde el backend
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
}

