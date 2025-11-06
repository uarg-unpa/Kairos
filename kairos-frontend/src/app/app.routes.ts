import { Routes } from '@angular/router';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { RolesComponent } from './pages/roles/roles';
import { PermisosComponent } from './pages/permisos/permisos';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth.guard';
import { RolFormComponent } from './pages/roles/rol-form';
import { PermisoFormComponent } from './pages/permisos/permiso-form';
import { UsuarioVerComponent } from './pages/usuario/ver';
import { UsuarioModificarComponent } from './pages/usuario/modificar';
import { UsuarioCrearComponent } from './pages/usuario/crear';
import { SalirComponent } from './pages/salir/salir';
import { PlanificacionComponent } from './pages/planificacion/planificacion.component';
import { WorkspaceTimerComponent } from './pages/workspace/workspace-timer.component'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
  { path: 'roles', component: RolesComponent, canActivate: [authGuard] },
  { path: 'permisos', component: PermisosComponent, canActivate: [authGuard] },
  { path: 'roles/crear', component: RolFormComponent, canActivate: [authGuard] },
  { path: 'permisos/crear', component: PermisoFormComponent, canActivate: [authGuard] },
  { path: 'usuario/ver/:id', component: UsuarioVerComponent, canActivate: [authGuard] },
  { path: 'usuario/modificar/:id', component: UsuarioModificarComponent, canActivate: [authGuard] },
  { path: 'usuario/crear', component: UsuarioCrearComponent, canActivate: [authGuard] },
  { path: 'salir', component: SalirComponent },
  {path: 'planificacion', component: PlanificacionComponent, canActivate: [authGuard]},
  {path: 'workspace', component: WorkspaceTimerComponent, canActivate: [authGuard] },
];
