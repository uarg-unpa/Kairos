import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { GlobalTimerComponent } from './components/global-timer/global-timer.component';
import { CommonModule } from '@angular/common';
import { ProjectContextService } from './services/project-context.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, GlobalTimerComponent, CommonModule], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  title = 'Kairos Frontend'; 

  readonly ROL_ADMIN = 'ADMINISTRADOR';
  readonly ROL_LIDER = 'LIDER';
  readonly ROL_MIEMBRO = 'MIEMBRO';
  // 2. Inyectar el Router en el constructor
  constructor(public router: Router, private auth: AuthService, private projectCtx: ProjectContextService) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.auth.isLoggedIn$.subscribe(isLoggedIn => {
      this.usuarioLogueado = isLoggedIn;
    });

    // Suscribirse a la información del usuario/rol
    this.auth.currentUser$.subscribe(user => {
        if (user) {
            this.usuarioNombre = user.nombre || 'Usuario';
            this.rolUsuario = (user.rol || (user.roles?.length ? user.roles[0] : null))?.toUpperCase() || null; 
        } else {
            this.usuarioNombre = 'Invitado';
            this.rolUsuario = null;
        }
    });

    // Persistir id de proyecto al navegar por rutas /proyecto/:id/...
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const id = this.currentProjectId;
        if (id) this.projectCtx.setProjectId(id);
      }
    });
  }

  // 3. Implementar la función de logout
  logout(): void {
    this.router.navigate(['/salir']);
  }

  // 4. Definir las propiedades necesarias para el HTML (incluso como placeholders)
  pageTitle: string = 'Kairos App'; 
  showUserAlert: boolean = false;
  usuarioLogueado: boolean = false; 
  usuarioNombre: string = 'Invitado'; 
  showMessages: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  rolUsuario: string | null = null;

  dismissAlert(): void {
    this.showUserAlert = false;
  }
  esRutaProyecto(): boolean {
    // Comprueba si la URL actual comienza con '/proyecto/'
    return this.router.url.startsWith('/proyecto/');
  }

  get currentProjectId(): number | null {
    const m = this.router.url.match(/^\/proyecto\/(\d+)/);
    return m ? Number(m[1]) : null;
  }
}
