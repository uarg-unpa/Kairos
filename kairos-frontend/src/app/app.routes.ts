import { Routes } from '@angular/router';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { RolesComponent } from './pages/roles/roles';
import { PermisosComponent } from './pages/permisos/permisos';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth.guard';
import { RolFormComponent } from './pages/roles/rol-form';
import { PermisoFormComponent } from './pages/permisos/permiso-form';
import { PermisoVerComponent } from './pages/permisos/permiso-ver';
import { PermisoModificarComponent } from './pages/permisos/permiso-modificar';
import { UsuarioVerComponent } from './pages/usuario/ver';
import { UsuarioCrearComponent } from './pages/usuario/crear';
import { SalirComponent } from './pages/salir/salir';
import { PlanificacionComponent } from './pages/planificacion/planificacion.component';
import { PlanificacionIteracion } from './pages/planificacion-iteracion/planificacion-iteracion';
import { WorkspaceTimerComponent } from './pages/workspace/workspace-timer.component'; 
import { InicioComponent } from './pages/inicio/inicio.component';
import { ProyectoDetalleComponent } from './pages/proyecto/detalle/proyecto-detalle.component';
import { EtapasComponent } from './pages/etapas/etapas';
import { IteracionesComponent } from './pages/iteraciones/iteraciones';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { RolVerComponent } from './pages/roles/rol-ver';
import { RolModificarComponent } from './pages/roles/rol-modificar';
import { AdminGuard } from './guards/admin.guard';
import { MiembrosComponent } from './pages/proyecto/miembros/miembros.component';
import { AyudaComponent } from './pages/ayuda/ayuda.component';
// import { PermisoVerComponent } from './pages/roles/permiso-ver';


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
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AdminGuard],
    data: { requiereAdmin: true }
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    data: { requiereAdmin: true },
    children: [
      { path: 'roles', component: RolesComponent },
      { path: 'permisos', component: RolesComponent },
      { path: 'rol', component: RolesComponent },

      // { path: 'config', component: ConfigComponent },
    ]
  },
  { path: 'roles', component: RolesComponent, canActivate: [authGuard] },
  { path: 'permisos', component: PermisosComponent, canActivate: [authGuard] },
  { path: 'roles/crear', component: RolFormComponent, canActivate: [authGuard] },
  { path: 'rol/ver/:id', component: RolVerComponent, canActivate: [authGuard] },
  { path: 'rol/modificar/:id', component: RolModificarComponent, canActivate: [authGuard] },
  { path: 'permisos/crear', component: PermisoFormComponent, canActivate: [authGuard] },
  { path: 'permiso/ver/:id', component: PermisoVerComponent, canActivate: [authGuard] },
  { path: 'permiso/modificar/:id', component: PermisoModificarComponent, canActivate: [authGuard] },
  { path: 'usuario/ver/:id', component: UsuarioVerComponent, canActivate: [authGuard] },
  { path: 'usuario/modificar/:id', redirectTo: 'usuario/ver/:id?mode=edit' },
  { path: 'usuario/crear', component: UsuarioCrearComponent, canActivate: [authGuard] },
  { path: 'salir', component: SalirComponent },
  {path: 'workspace', component: WorkspaceTimerComponent, canActivate: [authGuard] },
  { path: 'proyecto/:id', component: ProyectoDetalleComponent, canActivate: [authGuard] },
  // SUBRUTAS DEL PROYECTO
  { 
    path: 'proyecto/:id/planificacion', 
    component: PlanificacionComponent, 
    canActivate: [authGuard] 
  },
  {
  path: 'proyecto/:id/iteracion/:idIteracion/planificacion',
  component: PlanificacionIteracion,
  canActivate: [authGuard]
},

  { 
    path: 'proyecto/:id/etapas', 
    component: EtapasComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'proyecto/:id/workspace', 
    component: WorkspaceTimerComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'proyecto/:id/iteraciones', 
    component: IteracionesComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'proyecto/:id/iteraciones/:etapa', 
    component: IteracionesComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'proyecto/:id/dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  { path: 'proyecto/:id/miembros', component: MiembrosComponent, canActivate: [authGuard] },
  { path: 'iteraciones/etapa/:id', component: IteracionesComponent, canActivate: [authGuard] },
  { path: 'iteraciones', component: IteracionesComponent, canActivate: [authGuard] },
  { path: 'ayuda', component: AyudaComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: '' } // mantener este siempre al final
];
