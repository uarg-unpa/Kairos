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
  isAdmin: boolean;
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
      value.rol = 'ADMINISTRADOR'; 
    } else if (value.rol && value.rol.toUpperCase().includes('LIDER')) {
      value.rol = 'LÍDER'; 
    }
    else {
      value.rol = 'MIEMBRO'; 
    }

      localStorage.setItem(this.storageUserKey, JSON.stringify(value));
    } else {
      localStorage.removeItem(this.storageUserKey);
    }
    // actualizar estado del usuario actual
    this.currentUserSubject.next(value);
  }

  isAuthenticated(): boolean {
    return !!this.token;
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
    console.log('Comparando roles:', this.usuario.rol.toUpperCase(), 'con', role.toUpperCase());
    return this.usuario.rol.toUpperCase() === role.toUpperCase();
  }

}
