import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necesario si usas *ngIf, *ngFor en el HTML de este componente

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './login.html', // Asumiendo que este es el archivo que contiene el botón de login
  styleUrl: './login.css'
})
export class LoginComponent {

  // Inyectamos el Router para la navegación interna de Angular
  constructor(private router: Router) { 
    // Si tuviéramos un servicio de autenticación real, se inyectaría aquí
  }

  /**
   * Simula el proceso de login exitoso para fines de desarrollo (evitando la configuración de Google Cloud).
   * * Guarda un token falso en sessionStorage y redirige a la página principal del sistema.
   */
  loginConGoogle(): void {
    console.log('--- SIMULACIÓN DE LOGIN INICIADA ---');
    
    // 1. Simulación: Guardar un token o estado de usuario para marcar como logueado
    sessionStorage.setItem('auth_token', 'simulated_user_token_12345');
    console.log('Token de simulación guardado.');

    // 2. Redirigir al usuario a la ruta principal de la aplicación (que definimos como /usuarios)
    this.router.navigate(['/usuarios']).then(() => {
        console.log('Navegación exitosa a /usuarios.');
        // Nota: El AppComponent detectará este cambio de navegación y actualizará la UI.
    });
  }
}