import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';

export const routes: Routes = [
  // Ruta principal, redirige al login
  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
  
  // Ruta de la página de login
  { path: 'login', component: LoginComponent },
  
  // RUTA CRÍTICA: Spring Boot debe redirigir a esta URL después del login exitoso
  { path: 'login-callback', component: AuthCallbackComponent }, 
  
  // Puedes añadir la ruta del dashboard aquí
  // { path: 'dashboard', component: DashboardComponent }, 
  
  // ... otras rutas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppModule { }