
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const TOKEN_COOKIE_KEY = 'kairos_jwt';
const SECRET_SALT = 'K@iro$_NexT3ch_G#G#V#F#A!';

function cookieHash(content: string): string {
  const full = content + '|' + SECRET_SALT;
  let hash = 5381;
  for (let i = 0; i < full.length; i++) {
    hash = ((hash << 5) + hash) + full.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + encodeURIComponent(name) + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; samesite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=Lax`;
}

@Injectable({
    providedIn: 'root'
})
export class SessionTokenService {
    private _token: string | null = null;

    private expiredSubject = new Subject<void>();
    expired$ = this.expiredSubject.asObservable();

    constructor() {
        // Restaurar token desde cookie al arrancar (sobrevive al refresh)
        const raw = readCookie(TOKEN_COOKIE_KEY);
        if (raw) {
            const parts = raw.split('.');
            if (parts.length === 2) {
                const [encoded, sig] = parts;
                if (cookieHash(encoded) === sig) {
                    try {
                        this._token = atob(encoded);
                    } catch {
                        deleteCookie(TOKEN_COOKIE_KEY);
                    }
                } else {
                    deleteCookie(TOKEN_COOKIE_KEY);
                }
            }
        }
    }

    get token(): string | null {
        return this._token;
    }

    set token(value: string | null) {
        this._token = value;
        if (value) {
            const encoded = btoa(value);
            const sig = cookieHash(encoded);
            writeCookie(TOKEN_COOKIE_KEY, `${encoded}.${sig}`, 7);
        } else {
            deleteCookie(TOKEN_COOKIE_KEY);
        }
    }

    expire(): void {
        this._token = null;
        deleteCookie(TOKEN_COOKIE_KEY);
        this.expiredSubject.next();
    }
}
