import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaDTO } from '../../../services/categoria.service';
import { AlertService } from '../../../services/alert.service';
import { inject } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-categories-modal',
  templateUrl: './categories-modal.component.html',
  styleUrls: ['./categories-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CategoriesModalComponent implements OnInit {
  private alertService = inject(AlertService);
  @Input() categorias: CategoriaDTO[] = [];
  @Output() agregarCategoria = new EventEmitter<any>();
  @Output() editarCategoria = new EventEmitter<{ idCategoria: number; datos: any }>();
  @Output() eliminarCategoria = new EventEmitter<number>();
  @Output() cerrar = new EventEmitter<void>();

  private modal: any;
  categoriaEnEdicion: CategoriaDTO | null = null;
  categoriaEdicion = false;

  nuevaCategoria: any = {
    nombre: '',
    descripcion: '',
    idProyecto: null,
  };

  categoriaExpandida: string | null = null;

  ngOnInit(): void {
    const modalEl = document.getElementById('categoriasModal');
    if (modalEl) {
      this.modal = new (window as any).bootstrap.Modal(modalEl);
    }
  }

  abrirModal(): void {
    this.modal?.show();
  }

  cerrarModal(): void {
    this.resetModal();
    this.modal?.hide();
    this.cerrar.emit();
  }

  onAgregarCategoria(): void {
    if (!this.nuevaCategoria.nombre) return;
    this.agregarCategoria.emit(this.nuevaCategoria);
    this.resetModal();
  }

  seleccionarParaEditar(cat: CategoriaDTO): void {
    this.categoriaEnEdicion = cat;
    this.categoriaEdicion = true;
    this.nuevaCategoria = {
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      idProyecto: cat.proyectoId || 1
    };
  }

  onEditarCategoria(): void {
    if (!this.categoriaEnEdicion) return;
    this.editarCategoria.emit({
      idCategoria: this.categoriaEnEdicion.idCategoria!,
      datos: this.nuevaCategoria
    });
    this.resetModal();
  }

  async onEliminarCategoria(id: number): Promise<void> {
    const confirmado = await this.alertService.confirm(
      '¿Eliminar categoría?',
      '¿Estás seguro de que deseas eliminar esta categoría?',
      'Sí, eliminar'
    );

    if (!confirmado) return;

    this.eliminarCategoria.emit(id);
  }

  toggleDescripcion(nombre: string): void {
    this.categoriaExpandida = this.categoriaExpandida === nombre ? null : nombre;
  }

  resetModal(): void {
    this.nuevaCategoria = { nombre: '', descripcion: '', idProyecto: 1 };
    this.categoriaEdicion = false;
    this.categoriaEnEdicion = null;
  }
}