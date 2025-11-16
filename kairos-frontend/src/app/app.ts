import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { GlobalTimerComponent } from './components/global-timer/global-timer.component';
import { CommonModule } from '@angular/common';
import { LoadingService } from './services/loading.service';
import { IdCoderService } from './services/id-coder.service';
import { Proyecto } from '././models/proyecto.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, GlobalTimerComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  title = 'Kairos Frontend';
  proyecto: Proyecto | null = null;
  usuarioId: number | null = null;
  rolEnProyecto: 'Admin' | 'Lider' | 'Miembro' = 'Miembro';
  proyectoId: string | null = null;
  loadingService = inject(LoadingService);

  constructor(
    public router: Router, 
    public auth: AuthService,
    private idCoderService: IdCoderService
  ) {}

  ngOnInit(): void {
    this.auth.isLoggedIn$.subscribe(isLoggedIn => {
      this.usuarioLogueado = isLoggedIn;
    });

    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.usuarioNombre = user.nombre || 'Usuario';
        this.usuarioId = user.id ?? null; // << Aseguramos que usuarioId se actualice
        this.rolUsuario = (user.rol || (user.roles?.length ? user.roles[0] : null))?.toUpperCase() || null;
      } else {
        this.usuarioNombre = 'Invitado';
        this.usuarioId = null;
        this.rolUsuario = null;
      }
    });

    this.router.events.subscribe(() => {
      this.actualizarProyectoId();
    });
    this.actualizarProyectoId();
  }

  private actualizarProyectoId(): void {
    const url = this.router.url;
    // La expresión regular debería buscar cualquier cosa que no sea '/'
    const match = url.match(/\/proyecto\/([^\/]+)/);
    this.proyectoId = match ? match[1] : null; // << Ahora proyectoId guarda la CADENA CODIFICADA
  }

  getEncodedUserId(): string | null {
    if (this.usuarioId) {
      return this.idCoderService.encode(this.usuarioId);
    }
    return null;
  }

  // rolEnProyecto se calcula en vistas específicas si se requiere

  esAdmin(): boolean {
    return this.auth.esAdmin();
  }

  // Implementar la función de logout
  logout(): void {
    this.router.navigate(['/salir']);
  }

  // Propiedades usadas por la plantilla
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
}

