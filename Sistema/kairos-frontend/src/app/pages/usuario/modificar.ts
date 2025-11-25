import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-usuario-modificar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './modificar.html'
})
export class UsuarioModificarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');

    if (encodedId) {
      this.router.navigate(['/usuario/ver', encodedId], {
        queryParams: { mode: 'edit' }
      });
    } else {
      this.router.navigate(['/usuarios']);
    }
  }

  constructor() { }

  guardar() { }
}