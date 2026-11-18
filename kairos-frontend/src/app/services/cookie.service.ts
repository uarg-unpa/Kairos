import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly secretSalt = 'K@iro$_NexT3ch_G#G#V#F#A!';

  // obtiene el valor de una cookie por nombre
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + encodeURIComponent(name) + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  // verifica si existe una cookie
  has(name: string): boolean {
    return this.get(name) !== null;
  }

  //guarda una cookie con opciones de seguridad (path, SameSite, secure, expiration)
  set(
    name: string,
    value: string,
    options: { days?: number; path?: string; sameSite?: 'Lax' | 'Strict' | 'None'; secure?: boolean } = {}
  ): void {
    if (typeof document === 'undefined') return;

    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    const days = options.days ?? 7;
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    cookieStr += `; expires=${d.toUTCString()}`;
    cookieStr += `; path=${options.path ?? '/'}`;
    cookieStr += `; samesite=${options.sameSite ?? 'Lax'}`;

    const isSecure = options.secure ?? (typeof window !== 'undefined' && window.location.protocol === 'https:');
    if (isSecure) {
      cookieStr += '; secure';
    }

    document.cookie = cookieStr;
  }

  //elimina una cookie por nombre
  delete(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; samesite=Lax`;
  }

  // guarda un objeto codificado y protegido con firma de integridad contra manipulacion
  setSecureObject(name: string, obj: any, days: number = 7): void {
    try {
      const jsonStr = JSON.stringify(obj);
      // Codificación base64 segura para UTF-8
      const encoded = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      ));
      const signature = this.computeHash(encoded);
      this.set(name, `${encoded}.${signature}`, { days, path: '/', sameSite: 'Lax' });
    } catch (e) {
      console.error('Error guardando objeto en cookie segura:', e);
    }
  }

  // lee un objeto protegido validando su firma. Si el usuario modificó la cookie en DevTools,
  //la firma no coincide y se descarta el dato para evitar afectaciones o escalado de privilegios
  getSecureObject<T>(name: string): T | null {
    const raw = this.get(name);
    if (!raw) return null;

    const parts = raw.split('.');
    if (parts.length !== 2) {
      console.warn(`[Seguridad] Formato inválido en cookie "${name}". Descartando.`);
      this.delete(name);
      return null;
    }

    const [encoded, signature] = parts;
    const expectedSignature = this.computeHash(encoded);

    if (signature !== expectedSignature) {
      console.warn(`[Seguridad] Intento de manipulación detectado en cookie "${name}". La firma no coincide.`);
      this.delete(name);
      return null;
    }

    try {
      const jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(atob(encoded), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      console.warn(`[Seguridad] Error al decodificar cookie "${name}".`, e);
      this.delete(name);
      return null;
    }
  }

  // algoritmo de hash (DJB2 + clave salt) para calcular la firma de integridad
  private computeHash(content: string): string {
    const full = content + '|' + this.secretSalt;
    let hash = 5381;
    for (let i = 0; i < full.length; i++) {
      hash = ((hash << 5) + hash) + full.charCodeAt(i);
      hash = hash & hash; // convertir a entero de 32 bits
    }
    return Math.abs(hash).toString(36);
  }

  //limpia cualquier residuo de datos en LocalStorage para cumplir con la eliminación de local_storage
  clearLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('usuario_data');
      localStorage.removeItem('lastProjectId');

      // limpiar las clave que empiece con 'kairos' guardadas anteriormente
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('kairos') || key.includes('token') || key.includes('usuario'))) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error('Error limpiando LocalStorage:', e);
    }
  }
}

