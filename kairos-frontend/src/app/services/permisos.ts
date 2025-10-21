import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

export interface PermisoItem {
  id: number;
  nombre: string;
  roles: string[]; // set de strings desde backend
}

@Injectable({ providedIn: 'root' })
export class PermisosService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private baseUrl = (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/permisos';

  permisos = signal<PermisoItem[]>([]);

  constructor() {
    this.cargarPermisos();
  }

  cargarPermisos() {
    this.http.get<PermisoItem[]>(this.baseUrl).subscribe({
      next: (data) => this.permisos.set(data || []),
      error: (err) => console.error('Error al cargar permisos', err)
    });
  }
}

