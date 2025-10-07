import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: 'auth-callback.html',
  styleUrl: 'auth-callback.css'
})
export class AuthCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute, // Para leer los parámetros de la URL
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Obtener el token de la URL (si Spring lo devuelve como parámetro de consulta)
    const jwtToken = this.route.snapshot.queryParamMap.get('token');
    
    // **NOTA:** Si tu backend de Spring te pasa el objeto Usuario completo, 
    // podrías necesitar lógica adicional para extraerlo del JSON o de otros parámetros.

    if (jwtToken) {
      // 2. Guardar el token para usarlo en futuras peticiones al backend
      localStorage.setItem('jwt_token', jwtToken);
      
      // 3. Redirigir al usuario al área de la aplicación (e.g., el dashboard)
      this.router.navigate(['/dashboard']); // Cambia '/dashboard' a tu ruta de inicio
      
    } else {
      // Si no hay token, algo salió mal
      console.error('Error al iniciar sesión: Token JWT no encontrado.');
      // Redirigir de vuelta al login
      this.router.navigate(['/login']); 
    }
  }
}
