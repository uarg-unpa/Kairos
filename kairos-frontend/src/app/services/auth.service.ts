import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ConfigService } from './config.service';

interface AuthResponse {
  token: string;
  usuario?: any; // 👈 nombre correcto
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

  get token(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  set token(value: string | null) {
    if (value) {
      localStorage.setItem(this.storageKey, value);
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  get usuario(): any {
    const userStr = localStorage.getItem(this.storageUserKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  set usuario(value: any) {
    if (value) {
      localStorage.setItem(this.storageUserKey, JSON.stringify(value));
    } else {
      localStorage.removeItem(this.storageUserKey);
    }
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
}
