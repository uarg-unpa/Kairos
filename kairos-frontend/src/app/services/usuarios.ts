import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuarios';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private baseUrl = (this.config.get('apiBaseUrl') || 'http://localhost:8080') + '/api/usuarios';

  // ✅ Señal editable (WritableSignal)
  usuarios = signal<Usuario[]>([]);

  constructor() {
    console.log('🟢 UsuariosComponent cargado');
    this.cargarUsuarios();

  }

  cargarUsuarios() {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (data) => {
    const mapped: Usuario[] = (data || []).map((u: any, _idx: number) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: Array.isArray(u.roles)
            ? (u.roles as string[]).map((name, i) => ({ id: i, nombre: name }))
            : (u.rol || [])
        }));
        this.usuarios.set(mapped);
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  getUsuarios() {
    return this.usuarios.asReadonly(); // opcional, para evitar mutaciones desde afuera
  }

  eliminarUsuario(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((u: any) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: Array.isArray(u.roles)
          ? (u.roles as string[]).map((name, i) => ({ id: i, nombre: name }))
          : (u.rol || [])
      }) as Usuario)
    );
  }

  update(id: number, payload: { nombre: string; email: string }) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  create(payload: { nombre: string; email: string }) {
    return this.http.post(this.baseUrl, payload);
  }
}
