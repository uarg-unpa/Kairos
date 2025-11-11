import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (user.admin === true) {
          return true;
        } else {
          alert('Acceso denegado. Solo administradores.');
          this.router.navigate(['/inicio']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/inicio']);
        return of(false);
      })
    );
  }
}