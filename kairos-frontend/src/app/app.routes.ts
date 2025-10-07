import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthCallbackComponent } from './auth-callback/auth-callback';

// User management components
import { UsuariosComponent } from './usuarios/usuarios';
import { UsuariosCrearComponent } from './usuarios/usuarios-crear/usuarios-crear';
import { UsuariosVerComponent } from './usuarios/usuarios-ver/usuarios-ver';
import { UsuariosEditarComponent } from './usuarios/usuarios-editar/usuarios-editar';

// Role management components
import { RolesComponent } from './roles/roles';
import { RolesCrearComponent } from './roles/roles-crear/roles-crear';
import { RolesVerComponent } from './roles/roles-ver/roles-ver';
import { RolesEditarComponent } from './roles/roles-editar/roles-editar';

// Permission management components
import { PermisosComponent } from './permisos/permisos';
import { PermisosCrearComponent } from './permisos/permisos-crear/permisos-crear';
import { PermisosVerComponent } from './permisos/permisos-ver/permisos-ver';
import { PermisosEditarComponent } from './permisos/permisos-editar/permisos-editar';

// Dashboard component
import { DashboardComponent } from './dashboard/dashboard';
import { AppComponent } from './app';

export const routes: Routes = [
  // Ruta principal, redirige al login
      { path: '', redirectTo: '/login', pathMatch: 'full' }, 
        // Ruta de la página de login
        { path: 'login', component: LoginComponent },
        // RUTA CRÍTICA: Spring Boot debe redirigir a esta URL después del login exitoso
        { path: 'login-callback', component: AuthCallbackComponent }, 
  
// ----------------------------------------------------
  // 2. RUTAS /APLICACIÓN (Con navbar global)
  // ----------------------------------------------------
  {
    path: '', // Este path vacío actúa como el layout de todas las rutas protegidas
    component: AppComponent, // El AppComponent se carga primero (Navbar, Separador, <router-outlet>)
    children: [
      // Dashboard route
      { path: 'dashboard', component: DashboardComponent },
      
      // User management routes
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'usuarios/crear', component: UsuariosCrearComponent },
      { path: 'usuarios/ver/:id', component: UsuariosVerComponent },
      { path: 'usuarios/editar/:id', component: UsuariosEditarComponent },
      { path: 'usuarios/eliminar/:id', component: UsuariosEditarComponent }, 
      
      // Role management routes
      { path: 'roles', component: RolesComponent },
      { path: 'roles/crear', component: RolesCrearComponent },
      { path: 'roles/ver/:id', component: RolesVerComponent },
      { path: 'roles/editar/:id', component: RolesEditarComponent },
      { path: 'roles/eliminar/:id', component: RolesEditarComponent }, 
      
      // Permission management routes
      { path: 'permisos', component: PermisosComponent },
      { path: 'permisos/crear', component: PermisosCrearComponent },
      { path: 'permisos/ver/:id', component: PermisosVerComponent },
      { path: 'permisos/editar/:id', component: PermisosEditarComponent },
      { path: 'permisos/eliminar/:id', component: PermisosEditarComponent },
    ]
  },
  
  // Wildcard route for 404 (redirige al login por defecto)
  { path: '**', redirectTo: '/login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppModule { }