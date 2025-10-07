import { Routes } from '@angular/router';
import { AppComponent } from './app';
import { LoginComponent } from './login/login';
import { AuthCallbackComponent } from './auth-callback/auth-callback';
import { DashboardComponent } from './dashboard/dashboard';

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

export const routes: Routes = [
  // 1. RUTAS PÚBLICAS Y DE AUTENTICACIÓN
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { path: 'login-callback', component: AuthCallbackComponent }, 

// ----------------------------------------------------
  // 2. RUTAS DE LA APLICACIÓN (LAYOUT GLOBAL)
// ----------------------------------------------------
  {
    path: '', // Ruta padre: Carga el AppComponent
    component: AppComponent, // <<-- ESTE COMPONENTE ES TU LAYOUT MAESTRO
    children: [
      // Dashboard (ruta inicial después del login)
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Redirección si entran solo a /

      // GRUPO DE RUTAS: USUARIOS
      { 
        path: 'usuarios', 
        component: UsuariosComponent, // El componente principal de Usuarios (la tabla)
        children: [
          // Estas rutas se cargarán DENTRO del <router-outlet> del UsuariosComponent
          { path: 'crear', component: UsuariosCrearComponent },
          { path: 'ver/:id', component: UsuariosVerComponent },
          { path: 'editar/:id', component: UsuariosEditarComponent },
          { path: 'eliminar/:id', component: UsuariosEditarComponent }, // Asumo que es un modal en Editar
        ]
      },
      
      // GRUPO DE RUTAS: ROLES
      { 
        path: 'roles', 
        component: RolesComponent, // El componente principal de Roles (la tabla)
        children: [
          { path: 'crear', component: RolesCrearComponent },
          { path: 'ver/:id', component: RolesVerComponent },
          { path: 'editar/:id', component: RolesEditarComponent },
          { path: 'eliminar/:id', component: RolesEditarComponent },
        ]
      },
      
      // GRUPO DE RUTAS: PERMISOS
      { 
        path: 'permisos', 
        component: PermisosComponent, // El componente principal de Permisos (la tabla)
        children: [
          { path: 'crear', component: PermisosCrearComponent },
          { path: 'ver/:id', component: PermisosVerComponent },
          { path: 'editar/:id', component: PermisosEditarComponent },
          { path: 'eliminar/:id', component: PermisosEditarComponent },
        ]
      },
    ]
  },
  
  // Wildcard route for 404 (redirige al login por defecto)
  { path: '**', redirectTo: 'login' }
];

// Si estás usando Standalone Components, el módulo ya no es necesario aquí:
// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppModule { }
