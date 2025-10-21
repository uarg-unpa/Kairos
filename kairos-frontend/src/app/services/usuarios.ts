import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/usuarios';
import { toSignal } from '@angular/core/rxjs-interop';
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
    this.http.get<Usuario[]>(this.baseUrl).subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  getUsuarios() {
    return this.usuarios.asReadonly(); // opcional, para evitar mutaciones desde afuera
  }

  eliminarUsuario(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
