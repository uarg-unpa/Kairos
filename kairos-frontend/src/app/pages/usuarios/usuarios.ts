import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


 
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent {
  readonly ROL_ADMIN = 'ADMINISTRADOR';
  usuarioLogueado: boolean = false;
  rolUsuario: string | null = null;
  private usuariosService = inject(UsuariosService);
  usuarios: WritableSignal<any[]> = signal<any[]>([]);
  private apiUrl: string | null = null;
  constructor(
    public router: Router, 
    private auth: AuthService,
    private http: HttpClient,
    private config: ConfigService,
  ) {
    this.apiUrl = this.config.get('apiBaseUrl') ?? null;
    this.cargarUsuarios();
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // CARGAR TODOS LOS USUARIOS
  cargarUsuarios(): void {
    if (!this.apiUrl) {
      console.warn('API URL no configurada, no se cargarán los usuarios');
      return;
    }

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

  eliminarUsuario(id: number) {
    this.usuariosService.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios.update(usuarios => usuarios.filter(u => u.id !== id));
      },
      error: (err) => console.error('Error al eliminar usuario', err)
    });
  }
  esAdmin(): boolean {
    return this.auth.esAdmin();
  }
}
