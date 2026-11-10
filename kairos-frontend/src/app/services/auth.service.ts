    import { Injectable, inject } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Router } from '@angular/router';
    import { Observable, tap, BehaviorSubject } from 'rxjs';
    import { ConfigService } from './config.service';
    import { CookieService } from './cookie.service';

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
      private cookieService = inject(CookieService);

      readonly backendBaseUrl = this.config.get('apiBaseUrl') || 'http://localhost:8080';
      readonly googleAuthUrl = `${this.backendBaseUrl}/auth/google`;

      private readonly cookieSessionKey = 'kairos_session_active';
      private readonly cookieUserKey = 'kairos_user_data';

      private _token: string | null = null;
      private _usuario: any = null;

      private isLoggedInSubject: BehaviorSubject<boolean>;
      isLoggedIn$: Observable<boolean>;

      private currentUserSubject: BehaviorSubject<any>;
      currentUser$: Observable<any>;

      constructor() {
        // 1. Limpiar cualquier resto de LocalStorage existente (incidencia: borrar local_storage)
        this.cookieService.clearLocalStorage();

        // 2. Cargar usuario inicial desde la cookie protegida
        this._usuario = this.cookieService.getSecureObject(this.cookieUserKey);

        // 3. Inicializar sujetos reactivos
        this.currentUserSubject = new BehaviorSubject<any>(this._usuario);
        this.currentUser$ = this.currentUserSubject.asObservable();

        this.isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
        this.isLoggedIn$ = this.isLoggedInSubject.asObservable();

        // 4. Si hay sesión activa en cookie, sincronizar y verificar con el backend (/auth/me)
        if (this.isAuthenticated()) {
          this.getCurrentUser().subscribe({
            next: (user) => {
              this.usuario = user;
            },
            error: (err) => {
              if (err.status === 401 || err.status === 403) {
                console.warn('Sesión inválida o expirada en backend. Limpiando credenciales locales.');
                this.logout();
              }
            }
          });
        }
      }

      get token(): string | null {
        return this._token;
      }

      set token(value: string | null) {
        this._token = value;
        if (value) {
          this.cookieService.set(this.cookieSessionKey, '1', { days: 7, path: '/' });
        } else {
          this.cookieService.delete(this.cookieSessionKey);
        }
        this.isLoggedInSubject.next(!!value || this.cookieService.has(this.cookieSessionKey));
      }

      get usuario(): any {
        if (this._usuario) {
          return this._usuario;
        }
        this._usuario = this.cookieService.getSecureObject(this.cookieUserKey);
        return this._usuario;
      }

      set usuario(value: any) {
        if (value) {
          const rolFinal = value.admin === true
            ? 'ADMINISTRADOR'
            : this.normalizarRol(value.rol || value.roles?.[0]);

          const usuarioSeguro = {
            id: value.id,
            nombre: value.nombre,
            email: value.email,
            rol: rolFinal,
            admin: rolFinal === 'ADMINISTRADOR'
          };

          this._usuario = usuarioSeguro;
          this.cookieService.setSecureObject(this.cookieUserKey, usuarioSeguro, 7);
          this.currentUserSubject.next(usuarioSeguro);
        } else {
          this._usuario = null;
          this.cookieService.delete(this.cookieUserKey);
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
        return !!this._token || this.cookieService.has(this.cookieSessionKey) || !!this._usuario;
      }
      
      esAdmin(): boolean {
        return this.usuario?.admin === true;
      }

      logout(): void {
        this._token = null;
        this.usuario = null;
        this.cookieService.delete(this.cookieSessionKey);
        this.cookieService.delete(this.cookieUserKey);
        this.cookieService.clearLocalStorage();

        // Notificar al backend para eliminar la cookie HttpOnly
        this.http.post(`${this.backendBaseUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
          next: () => {},
          error: () => {}
        });

        this.isLoggedInSubject.next(false);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }

      exchangeGoogleToken(idToken: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.googleAuthUrl, { idToken }, { withCredentials: true }).pipe(
          tap((res) => {
            if (res?.token) {
              this.token = res.token;
            } else {
              this.cookieService.set(this.cookieSessionKey, '1', { days: 7, path: '/' });
              this.isLoggedInSubject.next(true);
            }
            if (res?.usuario) {
              this.usuario = res.usuario;
            }
          })
        );
      }

      // NUEVO: Obtener usuario actual
      getCurrentUser(): Observable<UserInfoResponse> {
        return this.http.get<UserInfoResponse>(`${this.backendBaseUrl}/auth/me`, { withCredentials: true }).pipe(
          tap(user => {
            this.usuario = user; // guarda en memoria y en cookie protegida
          })
        );
      }

      hasRole(role: string): boolean {
        if (!this.usuario || !this.usuario.rol) return false;
        return this.usuario.rol.toUpperCase() === role.toUpperCase();
      }

    }
