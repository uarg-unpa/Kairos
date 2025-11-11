import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('ERROR HTTP:', error);

        if (error.status === 401) {
          alert('Sesión expirada. Volviendo al login...');
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        if (error.status === 403) {
          alert('No tenés permisos para realizar esta acción');
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