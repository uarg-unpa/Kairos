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
import { DashboardComponent } from './pages/dashboard/dashboard';
import { projectContextGuard } from './guards/project-context.guard';
import { proyectoResolver } from './resolvers/proyecto.resolver';

export const routes: Routes = [
  // Redirección inicial explícita para evitar "pantalla en blanco" al abrir /
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'inicio', component: InicioComponent }
    ]
  },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
  { path: 'roles', component: RolesComponent, canActivate: [authGuard] },
  { path: 'permisos', component: PermisosComponent, canActivate: [authGuard] },
  { path: 'roles/crear', component: RolFormComponent, canActivate: [authGuard] },
  { path: 'permisos/crear', component: PermisoFormComponent, canActivate: [authGuard] },
  { path: 'usuario/ver/:id', component: UsuarioVerComponent, canActivate: [authGuard] },
  { path: 'usuario/modificar/:id', component: UsuarioModificarComponent, canActivate: [authGuard] },
  { path: 'usuario/crear', component: UsuarioCrearComponent, canActivate: [authGuard] },
  { path: 'salir', component: SalirComponent },
  { path: 'workspace', component: WorkspaceTimerComponent, canActivate: [authGuard, projectContextGuard], data: { target: 'workspace' } },
  { path: 'proyecto/:id', component: ProyectoDetalleComponent, canActivate: [authGuard] },
  // SUBRUTAS DEL PROYECTO
  { 
    path: 'proyecto/:id/planificacion', 
    component: PlanificacionComponent,
    resolve: { proyecto: proyectoResolver },
    canActivate: [authGuard] 
  },
  { 
    path: 'proyecto/:id/etapas', 
    component: EtapasComponent,
    resolve: { proyecto: proyectoResolver },
    canActivate: [authGuard] 
  },
  { 
    path: 'proyecto/:id/iteraciones', 
    component: IteracionesComponent,
    resolve: { proyecto: proyectoResolver },
    canActivate: [authGuard] 
  },
  { 
    path: 'proyecto/:id/workspace', 
    component: WorkspaceTimerComponent,
    resolve: { proyecto: proyectoResolver },
    canActivate: [authGuard] 
  },
  { 
    path: 'proyecto/:id/dashboard', 
    component: DashboardComponent,
    resolve: { proyecto: proyectoResolver },
    canActivate: [authGuard] 
  },
  // { path: 'proyecto/:id/planificacion', component: PlanificacionComponent, canActivate: [authGuard] },
  // {path: 'planificacion', component: PlanificacionComponent, canActivate: [authGuard]},
  { path: 'etapas', component: EtapasComponent, canActivate: [authGuard, projectContextGuard], data: { target: 'etapas' } },
  { path: 'iteraciones/:etapa', component: IteracionesComponent, canActivate: [authGuard] },
  { path: 'iteraciones/etapa/:id', component: IteracionesComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, projectContextGuard], data: { target: 'dashboard' } },
  { path: 'iteraciones', component: IteracionesComponent, canActivate: [authGuard, projectContextGuard], data: { target: 'iteraciones' } },
  { path: '**', redirectTo: '' } // mantener este siempre al final
];
