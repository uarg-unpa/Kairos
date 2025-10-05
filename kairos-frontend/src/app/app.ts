import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importamos CommonModule para poder usar *ngIf, *ngFor, etc. en el HTML

@Component({
  selector: 'app-root',
  standalone: true,
  // 💡 Importamos RouterLink y CommonModule para usar las directivas en el HTML
  imports: [RouterOutlet, RouterLink, CommonModule], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent {
  protected readonly title = signal('kairos-frontend');
  
  // 🎯 Estado de simulación para mostrar/ocultar elementos de la UI
  protected usuarioLogueado: boolean = false;
  protected usuarioNombre: string = "Usuario Simulado UNPA"; 

  // Inyectamos el Router para poder navegar y suscribirnos a eventos
  constructor(private router: Router) {
    // 1. Inicializar el estado de login al cargar el componente
    this.checkLoginStatus();
    
    // 2. Escuchar eventos de navegación (como después de un login o logout) para actualizar el estado
    this.router.events.subscribe(() => {
        this.checkLoginStatus();
    });
  }

  /**
   * Verifica si hay un token de simulación guardado para determinar el estado de login.
   * La existencia de 'auth_token' en sessionStorage indica que el usuario está logueado.
   */
  checkLoginStatus(): void {
    this.usuarioLogueado = !!sessionStorage.getItem('auth_token');
  }

  /**
   * Implementación de logout simulado.
   * Limpia el token y redirige a la página de login.
   */
  logout(): void {
    console.log('Usuario deslogueado. Limpiando sesión...');
    sessionStorage.removeItem('auth_token'); 
    this.usuarioLogueado = false; // Actualizar el estado
    this.router.navigate(['/login']);
  }
}