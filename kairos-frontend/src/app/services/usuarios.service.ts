// src/app/services/usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
    private apiUrl = '';
    usuarios: WritableSignal<any[]> = signal<any[]>([]);

    constructor(
        private http: HttpClient,
        private config: ConfigService,
        private auth: AuthService 
    ) {
        this.apiUrl = this.config.get('apiBaseUrl') || '';
        this.cargarUsuarios();
    }

    private getHeaders(): HttpHeaders {
        const token = this.auth.token;
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    cargarUsuarios(): void {
        console.log('CARGANDO USUARIOS DESDE API...');
        this.http.get<any[]>(`${this.apiUrl}/api/usuarios`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => {
                    const normalizados = data.map(u => ({
                        ...u,
                        rol: u.roles?.[0]?.nombre || 'MIEMBRO', // si querés mantener "rol"
                        roles: u.roles || []
                    }));
                    console.log('USUARIOS NORMALIZADOS:', normalizados);
                    this.usuarios.set(normalizados);
                    },
                error: (err) => {
                    console.error('ERROR AL CARGAR USUARIOS:', err);
                    if (err.status === 401) {
                        this.auth.logout();
                    }
                }
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