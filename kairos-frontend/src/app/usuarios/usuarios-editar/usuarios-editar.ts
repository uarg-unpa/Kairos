import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-usuarios-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-editar.html',
  styleUrl: './usuarios-editar.css'
})
export class UsuariosEditarComponent implements OnInit {
  usuarioForm: FormGroup;
  loading = false;
  loadingData = true;
  error: string | null = null;
  rolesDisponibles = ['ADMIN', 'USER', 'MODERATOR'];
  usuarioId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    this.usuarioId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.loadingData = true;
    this.error = null;

    // TODO: Replace with actual API call
    setTimeout(() => {
      // Mock data
      const usuario = {
        id: this.usuarioId!,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@unpa.edu.ar',
        activo: true,
        roles: ['ADMIN', 'USER']
      };

      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        activo: usuario.activo,
        roles: usuario.roles
      });

      this.loadingData = false;
    }, 1000);
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.loading = true;
      this.error = null;

      // TODO: Replace with actual API call
      setTimeout(() => {
        console.log('Actualizando usuario:', this.usuarioForm.value);
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
