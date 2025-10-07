import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    usuarios: 0,
    roles: 0,
    permisos: 0
  };
  loading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.loading = true;
    
    // TODO: Replace with actual API calls
    setTimeout(() => {
      this.stats = {
        usuarios: 3,
        roles: 2,
        permisos: 4
      };
      this.loading = false;
    }, 1000);
  }

  navegarAUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }

  navegarARoles(): void {
    this.router.navigate(['/roles']);
  }

  navegarAPermisos(): void {
    this.router.navigate(['/permisos']);
  }
}
