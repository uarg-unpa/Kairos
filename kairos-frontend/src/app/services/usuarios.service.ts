import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
    private apiUrl: string | null = null;
    usuarios = signal<any[]>([]); // ← TU SIGNAL

    constructor(
        private http: HttpClient,
        private config: ConfigService
    ) {
        this.apiUrl = this.config.get('apiBaseUrl') ?? null;

        this.cargarUsuarios();
    }

    // GET HEADERS (JWT)
    getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token') || '';
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    cargarUsuarios(): void {
        this.http.get<any[]>(`${this.apiUrl}/api/usuarios`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => this.usuarios.set(data),
                error: (err) => console.error('Error al cargar usuarios', err)
            });
    }

    searchByName(query: string): Observable<any[]> {
        if (!query || query.trim().length < 2) {
            return new Observable(observer => {
                observer.next([]);
                observer.complete();
            });
        }

        return this.http.get<any[]>(
            `${this.apiUrl}/api/usuarios/search?nombre=${encodeURIComponent(query.trim())}`,
            { headers: this.getHeaders() }
        );
    }

    eliminarUsuario(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/api/usuarios/${id}`, { headers: this.getHeaders() });
    }
}