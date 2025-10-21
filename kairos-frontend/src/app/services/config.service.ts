import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface AppConfig {
  googleClientId?: string;
  apiBaseUrl?: string;
  // claves alternativas aceptadas (no se exponen, se normalizan al cargar)
  GOOGLE_CLIENT_ID?: string;
  google_client_id?: string;
  API_BASE_URL?: string;
  api_base_url?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private config: AppConfig = {};

  load(): Promise<void> {
    // Carga configuración en runtime desde assets/env.json
    return new Promise((resolve) => {
      const url = `assets/env.json?v=${Date.now()}`; // evita caché del navegador en dev
      this.http.get<AppConfig>(url).subscribe({
        next: (cfg) => {
          const c = cfg || {} as AppConfig;
          const googleClientId = c.googleClientId || c.GOOGLE_CLIENT_ID || c.google_client_id;
          const apiBaseUrl = c.apiBaseUrl || c.API_BASE_URL || c.api_base_url;
          this.config = { ...c, googleClientId, apiBaseUrl } as AppConfig;
          resolve();
        },
        error: () => resolve() // continúa aunque no exista el archivo
      });
    });
  }

  get<T extends keyof AppConfig>(key: T): AppConfig[T] | undefined {
    return this.config[key];
  }
}
