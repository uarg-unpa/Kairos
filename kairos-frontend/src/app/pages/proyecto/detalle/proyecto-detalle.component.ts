import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProyectoService } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';
import { Proyecto } from '../../../models/proyecto.model';
import { FormsModule } from '@angular/forms';

// import { Component } from '@angular/core';
// ``````typescript
// @Component({
//   selector: 'app-proyecto-detalle',
//   templateUrl: './proyecto-detalle.component.html',
//   styleUrls: ['./proyecto-detalle.component.css'],
//   imports: [FormsModule]
// })

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proyecto-detalle.component.html',
  styleUrls: ['./proyecto-detalle.component.css']
})
export class ProyectoDetalleComponent implements OnInit {
  proyecto: Proyecto | null = null;
  rol: string = 'Miembro'; // Default
  mostrarModalEditar = false;
  proyectoEdit: any = {};
  errorMensaje: string | null = null;

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
  abrirModalEditar(): void {
  this.proyectoEdit = { ...this.proyecto };
  this.mostrarModalEditar = true;
}
cerrarModalEditar(): void {
  this.mostrarModalEditar = false;
  this.errorMensaje = null;
}
onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => this.proyectoEdit.logo = e.target.result;
    reader.readAsDataURL(file);
  }
}
actualizarProyecto(): void {
  this.errorMensaje = null;

  if (!this.proyectoEdit.nombre?.trim() || !this.proyectoEdit.equipo?.trim()) {
    this.errorMensaje = 'Nombre y equipo son obligatorios';
    return;
  }

  const payload = {
    nombre: this.proyectoEdit.nombre.trim(),
    equipo: this.proyectoEdit.equipo.trim(),
    descripcion: this.proyectoEdit.descripcion || '',
    fechaInicio: this.proyectoEdit.fechaInicio || null, // ← String o null
    estado: this.proyectoEdit.estado || 'En Progreso',
    logo: this.proyectoEdit.logo || null
  };

  this.proyectoService.actualizarProyecto(this.proyecto!.idProyecto, payload).subscribe({
    next: (actualizado) => {
      this.proyecto = actualizado;
      alert('Proyecto actualizado con éxito');
      this.cerrarModalEditar();
    },
    error: (err) => {
      this.errorMensaje = err.error?.error || 'Error al actualizar';
    }
  });
}

  private cargarRol(): void {
  this.authService.currentUser$.subscribe(user => {
    const rolRaw = user?.rol || 'Miembro';

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
  });
}
  
}