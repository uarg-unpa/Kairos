import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-salir',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './salir.html'
})
export class SalirComponent implements OnInit {
  private auth = inject(AuthService);

  ngOnInit(): void {
    // Solo limpia el token para mostrar esta vista; no redirige automáticamente
    this.auth.token = null;
  }
}
