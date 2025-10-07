import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-roles-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles-editar.html',
  styleUrl: './roles-editar.css'
})
export class RolesEditarComponent implements OnInit {
  rolForm: FormGroup;
  loading = false;
  loadingData = true;
  error: string | null = null;
  permisosDisponibles = ['PERMISO_USUARIOS', 'PERMISO_ROLES', 'PERMISO_PERMISOS'];
  rolId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      activo: [true],
      permisos: [[]]
    });
  }

  ngOnInit(): void {
    this.rolId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarRol();
  }

  cargarRol(): void {
    this.loadingData = true;
    this.error = null;

    // TODO: Replace with actual API call
    setTimeout(() => {
      // Mock data
      const rol = {
        id: this.rolId!,
        nombre: 'ADMIN',
        descripcion: 'Administrador del sistema con acceso completo',
        activo: true,
        permisos: ['PERMISO_USUARIOS', 'PERMISO_ROLES', 'PERMISO_PERMISOS']
      };

      this.rolForm.patchValue({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        activo: rol.activo,
        permisos: rol.permisos
      });

      this.loadingData = false;
    }, 1000);
  }

  onSubmit(): void {
    if (this.rolForm.valid) {
      this.loading = true;
      this.error = null;

      // TODO: Replace with actual API call
      setTimeout(() => {
        console.log('Actualizando rol:', this.rolForm.value);
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
