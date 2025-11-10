import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProyectoService } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';
import { Proyecto } from '../../../models/proyecto.model';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './proyecto-detalle.component.html',
  styleUrls: ['./proyecto-detalle.component.css']
})
export class ProyectoDetalleComponent implements OnInit {
  proyecto: Proyecto | null = null;
  rol: string = 'Miembro'; // Default

  constructor(
    private route: ActivatedRoute,
    private proyectoService: ProyectoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProyecto(+id);
    }
    this.cargarRol();
  }

  private cargarProyecto(id: number): void {
    this.proyectoService.getProyectoById(id).subscribe({
      next: (proyecto) => this.proyecto = proyecto,
      error: (err) => console.error('Error al cargar proyecto', err)
    });
  }

  private cargarRol(): void {
  this.authService.currentUser$.subscribe(user => {
    const rolRaw = user?.rol || 'Miembro';
    console.log('ROL CRUDO:', rolRaw);

    // NORMALIZA: mayúsculas + sin acentos
    const rolNormalizado = rolRaw
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita tildes

    if (rolNormalizado.includes('ADMIN')) {
      this.rol = 'Admin';
    } else if (rolNormalizado.includes('LIDER')) {
      this.rol = 'Líder';
    } else {
      this.rol = 'Miembro';
    }

    console.log('ROL NORMALIZADO:', this.rol);
  });
}
}