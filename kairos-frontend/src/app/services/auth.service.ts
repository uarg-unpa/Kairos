import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';

interface AuthResponse {
  token: string;
  usuario?: any; // 👈 nombre correcto
}
interface UserInfoResponse {
  id: number;
  nombre: string;
  email: string;
  permissions: string[];
  admin: boolean;
  roles?: string[];
  rol?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private config = inject(ConfigService);

  readonly backendBaseUrl = this.config.get('apiBaseUrl') || 'http://localhost:8080';
  readonly googleAuthUrl = `${this.backendBaseUrl}/auth/google`;

  private storageKey = 'jwt_token';
  private storageUserKey = 'usuario_data';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(this.usuario);
  currentUser$ = this.currentUserSubject.asObservable();

  get token(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  set token(value: string | null) {
    if (value) {
      localStorage.setItem(this.storageKey, value);
    } else {
      localStorage.removeItem(this.storageKey);
    }
    // actualizar estado de logueo
    this.isLoggedInSubject.next(!!value);
  }

  get usuario(): any {
    const userStr = localStorage.getItem(this.storageUserKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  set usuario(value: any) {
    if (value) {
      if (value.admin === true) {
        const usuarioSeguro = {
          id: value.id,
          nombre: value.nombre,
          email: value.email,
          rol: 'ADMINISTRADOR',
          admin: true
        };
        localStorage.setItem(this.storageUserKey, JSON.stringify(usuarioSeguro));
        this.currentUserSubject.next(usuarioSeguro);
        return;
      }
      const rolFinal = this.normalizarRol(value.rol || value.roles?.[0]);

      const usuarioSeguro = {
        id: value.id,
        nombre: value.nombre,
        email: value.email,
        rol: rolFinal,
        admin: rolFinal === 'ADMINISTRADOR'
      };

      localStorage.setItem(this.storageUserKey, JSON.stringify(usuarioSeguro));
      this.currentUserSubject.next(usuarioSeguro);
    } else {
      localStorage.removeItem(this.storageUserKey);
      this.currentUserSubject.next(null);
    }
  }

  private normalizarRol(rolRaw: string): string {
    if (!rolRaw) return 'MIEMBRO';
    const normalized = rolRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes('ADMINISTRADOR') || normalized.includes('ADMIN')) return 'ADMINISTRADOR';
    if (normalized.includes('LIDER')) return 'LIDER';
    return 'MIEMBRO';
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
  
  esAdmin(): boolean {
    return this.usuario?.admin === true;
  }

  logout(): void {
    this.token = null;
    this.usuario = null;
    this.router.navigate(['/login']);
  }

  exchangeGoogleToken(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.googleAuthUrl, { idToken }).pipe(
      tap((res) => {
        if (res?.token) {
          this.token = res.token;
        }
        if (res?.usuario) {
          this.usuario = res.usuario;
        }
      })
    );
  }


  // NUEVO: Obtener usuario actual
  getCurrentUser(): Observable<UserInfoResponse> {
    return this.http.get<UserInfoResponse>(`${this.backendBaseUrl}/auth/me`).pipe(
      tap(user => {
        this.usuario = user; // guarda en localStorage
      })
    );
  }

  hasRole(role: string): boolean {
    if (!this.usuario || !this.usuario.rol) return false;
    return this.usuario.rol.toUpperCase() === role.toUpperCase();
  }

}
