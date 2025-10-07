import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-crear.html',
  styleUrl: './usuarios-crear.css'
})
export class UsuariosCrearComponent implements OnInit {
  usuarioForm: FormGroup;
  loading = false;
  error: string | null = null;
  rolesDisponibles = ['ADMIN', 'USER', 'MODERATOR'];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      activo: [true],
      roles: [[]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.loading = true;
      this.error = null;

      // TODO: Replace with actual API call
      setTimeout(() => {
        console.log('Creando usuario:', this.usuarioForm.value);
        this.loading = false;
        this.router.navigate(['/usuarios']);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/usuarios']);
  }

  onRoleChange(role: string, event: any): void {
    const roles = this.usuarioForm.get('roles')?.value || [];
    if (event.target.checked) {
      roles.push(role);
    } else {
      const index = roles.indexOf(role);
      if (index > -1) {
        roles.splice(index, 1);
      }
    }
    this.usuarioForm.get('roles')?.setValue(roles);
  }

  isRoleSelected(role: string): boolean {
    const roles = this.usuarioForm.get('roles')?.value || [];
    return roles.includes(role);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['email']) {
        return 'Email inválido';
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }
}
