import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  errorMessage: string | null = null;
  // No necesitas inyectar Router si solo haces redirección externa.
  // Pero lo dejamos por si lo usas en el constructor.
  constructor(private router: Router) { 
    // ...
  }

  /**
   * Redirige el navegador al endpoint de Spring Boot para iniciar el flujo OAuth2.
   */
  loginConGoogle(): void {
    console.log('--- INICIANDO REDIRECCIÓN A SPRING BOOT PARA OAUTH2 ---');
    
    // URL completa del endpoint de Spring Boot que inicia la autenticación de Google
    // Asumimos que tu Spring Boot está en 8085 y ese es el endpoint de OAuth2.
    const googleAuthUrl = 'http://localhost:8085/oauth2/authorization/google'; 
    
    // Redirige el navegador a una URL EXTERNA. Esto detiene la aplicación Angular.
    window.location.href = googleAuthUrl;
  }

  dismissError(): void {
    this.errorMessage = null;
  }
}