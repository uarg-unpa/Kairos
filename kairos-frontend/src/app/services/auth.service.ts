import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ConfigService } from './config.service';

interface AuthResponse {
  token: string;
  user?: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private config = inject(ConfigService);

  // Usa apiBaseUrl desde config o fallback a localhost
  readonly backendBaseUrl = (this.config.get('apiBaseUrl') || 'http://localhost:8080');
  readonly googleAuthUrl = `${this.backendBaseUrl}/auth/google`;

  // Guarda/lee el JWT
  private storageKey = 'jwt_token';

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

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout(): void {
    this.token = null;
    this.router.navigate(['/login']);
  }

  // Intercambia el ID Token de Google por el JWT del backend
  exchangeGoogleToken(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.googleAuthUrl, { idToken }).pipe(
      tap((res) => {
        if (res?.token) {
          this.token = res.token;
        }
      })
    );
  }
}
