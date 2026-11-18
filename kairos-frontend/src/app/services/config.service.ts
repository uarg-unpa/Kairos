
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';

interface AppConfig {
  googleClientId?: string;
  apiBaseUrl?: string;
  GOOGLE_CLIENT_ID?: string;
  google_client_id?: string;
  API_BASE_URL?: string;
  api_base_url?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  // HttpBackend evita ejecutar los interceptores durante la carga inicial
  private http = new HttpClient(inject(HttpBackend));
  private config: AppConfig = {};

  load(): Promise<void> {
    const url = `assets/env.json?v=${Date.now()}`;

    return this.http.get<AppConfig>(url).toPromise()
      .then(cfg => {
        const c = cfg || {};

        this.config = {
          ...c,
          googleClientId:
            c.googleClientId || c.GOOGLE_CLIENT_ID || c.google_client_id,
          apiBaseUrl:
            c.apiBaseUrl || c.API_BASE_URL || c.api_base_url
        };

        console.log('Configuración cargada:', this.config);
      })
      .catch(err => {
        console.error('No se pudo cargar assets/env.json:', err);
        throw err;
      });
  }

  get<T extends keyof AppConfig>(key: T): AppConfig[T] | undefined {
    return this.config[key];
  }
}
