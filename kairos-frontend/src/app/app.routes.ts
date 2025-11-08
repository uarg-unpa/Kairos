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
import { InicioComponent } from './pages/inicio/inicio.component';
import { ProyectoDetalleComponent } from './pages/proyecto/detalle/proyecto-detalle.component';
import { EtapasComponent } from './pages/etapas/etapas';
import { IteracionesComponent } from './pages/iteraciones/iteraciones';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent }
    ]
  },
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
  { path: 'proyecto/:id', component: ProyectoDetalleComponent, canActivate: [authGuard] },
  { path: 'planificacion', component: PlanificacionComponent, canActivate: [authGuard] },
  { path: 'etapas', component: EtapasComponent, canActivate: [authGuard] },
  { path: 'iteraciones/:etapa', component: IteracionesComponent, canActivate: [authGuard] },
  { path: 'iteraciones/etapa/:id', component: IteracionesComponent, canActivate: [authGuard] },
  { path: 'iteraciones', component: IteracionesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' } // mantener este siempre al final
];
