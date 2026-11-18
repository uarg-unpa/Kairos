
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { CookieService } from '../services/cookie.service';
import { SessionTokenService } from '../services/session-token.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private router = inject(Router);
  private alertService = inject(AlertService);
  private cookieService = inject(CookieService);
  private sessionToken = inject(SessionTokenService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        console.error('ERROR HTTP:', error);

        if (
          error.status === 401 &&
          !req.url.endsWith('/auth/logout') &&
          !req.url.endsWith('/auth/me')
        ) {
          this.alertService.warning(
            'Sesión expirada',
            'Volviendo al login...'
          );

          // Limpiar el token en memoria y notificar a AuthService
          this.sessionToken.expire();

          // Limpiar las cookies de sesión y usuario
          this.cookieService.delete('kairos_session_active');
          this.cookieService.delete('kairos_user_data');

          this.cookieService.clearLocalStorage();

          this.router.navigate(['/login']);
        }

        if (error.status === 403) {
          this.alertService.error(
            'Acceso denegado',
            'No tenés permisos para realizar esta acción'
          );

          this.router.navigate(['/inicio']);
        }

        if (error.status === 404) {
          console.warn('Recurso no encontrado:', req.url);
        }

        return throwError(() => error);
      })
    );
  }
}
