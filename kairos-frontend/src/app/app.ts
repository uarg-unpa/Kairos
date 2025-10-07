import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Kairos Frontend';
  // 2. Inyectar el Router en el constructor
  constructor(private router: Router) {}

  // 3. Implementar la función de logout
  logout(): void {
    console.log('Cerrando sesión y redirigiendo a login...');
    
    // Lógica para limpiar el token (Ajusta la clave si usas una diferente)
    localStorage.removeItem('jwt_token'); 
    
    // Redirigir al usuario a la ruta de login
    this.router.navigate(['/login']);
  }

  // 4. Definir las propiedades necesarias para el HTML (incluso como placeholders)
  pageTitle: string = 'Kairos App'; 
  showUserAlert: boolean = false;
  usuarioLogueado: boolean = false; 
  usuarioNombre: string = 'Invitado'; 
  showMessages: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  dismissAlert(): void {
    this.showUserAlert = false;
  }
}
