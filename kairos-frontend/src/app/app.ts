import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Kairos Frontend';
  // 2. Inyectar el Router en el constructor
  constructor(private router: Router, private auth: AuthService) {}

  // 3. Implementar la función de logout
  logout(): void {
    this.auth.logout();
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
