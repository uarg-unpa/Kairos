import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permisos-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permisos-crear.html',
  styleUrl: './permisos-crear.css'
})
export class PermisosCrearComponent implements OnInit {
  permisoForm: FormGroup;
  loading = false;
  error: string | null = null;
  categoriasDisponibles = ['Gestión de Usuarios', 'Gestión de Roles', 'Gestión de Permisos', 'Reportes', 'Configuración'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.permisoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['', [Validators.required]],
      activo: [true]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.permisoForm.valid) {
      this.loading = true;
      this.error = null;

      // TODO: Replace with actual API call
      setTimeout(() => {
        console.log('Creando permiso:', this.permisoForm.value);
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
