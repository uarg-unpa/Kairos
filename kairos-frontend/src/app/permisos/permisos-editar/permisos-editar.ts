import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-permisos-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permisos-editar.html',
  styleUrl: './permisos-editar.css'
})
export class PermisosEditarComponent implements OnInit {
  permisoForm: FormGroup;
  loading = false;
  loadingData = true;
  error: string | null = null;
  categoriasDisponibles = ['Gestión de Usuarios', 'Gestión de Roles', 'Gestión de Permisos', 'Reportes', 'Configuración'];
  permisoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.permisoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['', [Validators.required]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.permisoId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarPermiso();
  }

  cargarPermiso(): void {
    this.loadingData = true;
    this.error = null;

    // TODO: Replace with actual API call
    setTimeout(() => {
      // Mock data
      const permiso = {
        id: this.permisoId!,
        nombre: 'PERMISO_USUARIOS',
        descripcion: 'Permiso para gestionar usuarios del sistema',
        activo: true,
        categoria: 'Gestión de Usuarios'
      };

      this.permisoForm.patchValue({
        nombre: permiso.nombre,
        descripcion: permiso.descripcion,
        activo: permiso.activo,
        categoria: permiso.categoria
      });

      this.loadingData = false;
    }, 1000);
  }

  onSubmit(): void {
    if (this.permisoForm.valid) {
      this.loading = true;
      this.error = null;

      // TODO: Replace with actual API call
      setTimeout(() => {
        console.log('Actualizando permiso:', this.permisoForm.value);
        this.loading = false;
        this.router.navigate(['/permisos']);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/permisos']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.permisoForm.controls).forEach(key => {
      const control = this.permisoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.permisoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }
}
