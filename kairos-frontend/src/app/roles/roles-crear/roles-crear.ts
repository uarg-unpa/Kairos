import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles-crear.html',
  styleUrl: './roles-crear.css'
})
export class RolesCrearComponent implements OnInit {
  rolForm: FormGroup;
  loading = false;
  error: string | null = null;
  permisosDisponibles = ['PERMISO_USUARIOS', 'PERMISO_ROLES', 'PERMISO_PERMISOS'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      activo: [true],
      permisos: [[]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.rolForm.valid) {
      this.loading = true;
      this.error = null;

      // TODO: Replace with actual API call
      setTimeout(() => {
        console.log('Creando rol:', this.rolForm.value);
        this.loading = false;
        this.router.navigate(['/roles']);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/roles']);
  }

  onPermisoChange(permiso: string, event: any): void {
    const permisos = this.rolForm.get('permisos')?.value || [];
    if (event.target.checked) {
      permisos.push(permiso);
    } else {
      const index = permisos.indexOf(permiso);
      if (index > -1) {
        permisos.splice(index, 1);
      }
    }
    this.rolForm.get('permisos')?.setValue(permisos);
  }

  isPermisoSelected(permiso: string): boolean {
    const permisos = this.rolForm.get('permisos')?.value || [];
    return permisos.includes(permiso);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.rolForm.controls).forEach(key => {
      const control = this.rolForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.rolForm.get(fieldName);
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
