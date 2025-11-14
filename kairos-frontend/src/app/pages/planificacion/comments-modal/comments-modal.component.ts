import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../models/usuarios';

declare var bootstrap: any;

@Component({
  selector: 'app-comments-modal',
  templateUrl: './comments-modal.component.html',
  styleUrls: ['./comments-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CommentsModalComponent implements OnInit {
  @Input() usuarioActual: Usuario | null = null;
  @Output() agregarComentario = new EventEmitter<{ tareaId: number; contenido: string }>();
  @Output() cerrar = new EventEmitter<void>();

  private modal: any;
  tareaSeleccionada: number | null = null;
  nuevoComentarioModal = { contenido: '' };

  ngOnInit(): void {
    const modalEl = document.getElementById('addComentarioModal');
    if (modalEl) {
      this.modal = new (window as any).bootstrap.Modal(modalEl);
    }
  }

  abrirModal(tareaId: number): void {
    this.tareaSeleccionada = tareaId;
    this.nuevoComentarioModal.contenido = '';
    this.modal?.show();
  }

  cerrarModal(): void {
    this.modal?.hide();
    this.cerrar.emit();
  }

  onAgregarComentario(): void {
    if (!this.tareaSeleccionada || !this.nuevoComentarioModal.contenido.trim()) return;
    
    this.agregarComentario.emit({
      tareaId: this.tareaSeleccionada,
      contenido: this.nuevoComentarioModal.contenido
    });

    this.nuevoComentarioModal.contenido = '';
    this.cerrarModal();
  }
}
