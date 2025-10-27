import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/tarea.service';
import { CategoriaService, CategoriaDTO } from '../../services/categoria.service';
import { Tarea } from '../../models/tarea.model';
import { Usuario } from '../../models/usuarios';
import { UsuariosService } from '../../services/usuarios';
import { effect } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-planificacion',
  templateUrl: './planificacion.component.html',
  styleUrls: ['./planificacion.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PlanificacionComponent implements OnInit {
  private addTaskModal: any;
  usuarios: Usuario[] = [];
  categorias: CategoriaDTO[] = [];
  tareas: Tarea[] = [];
  nuevaTarea: any = {
    nombre: '',
    descripcion: '',
    categoria: '',      // nombre para mostrar en el select (opcional)
    categoriaId: null,  // ID real que enviamos al backend
    prioridad: 'Media',
    estado: 'Planificada',
    fechaCreacion: '',
    fechaFin: '',
    horasEstimadas: 0,
    usuarioId: 1,
    iteracionId: 7
  };

  constructor(
    private categoriaService: CategoriaService,
    private taskService: TaskService,
    private usuariosService: UsuariosService,

  ) {
    effect(() => {
      this.usuarios = this.usuariosService.usuarios();
      console.log('Usuarios actualizados:', this.usuarios);
    });
  }

  ngOnInit(): void {
    this.cargarTareas();
    this.cargarCategorias();
    
     const modalEl = document.getElementById('addTaskModal');
    if (modalEl) {
      this.addTaskModal = new bootstrap.Modal(modalEl);
    }
  }



  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe(data => {
      this.categorias = data;
    });
  }

  cargarTareas() {
    this.taskService.getTareas().subscribe({
      next: (data) => {
        this.tareas = data; // No mapees a string[], mantené Categoria[]
        console.log(this.tareas); // Verifica que todas las tareas llegaron
      },
      error: (err) => console.error(err)
    });
  }



  
  abrirModal() {
    this.addTaskModal?.show();
  }

  cerrarModal() {
    this.addTaskModal?.hide();
  }



  agregarTarea() {
    if (!this.nuevaTarea.nombre) return;

    const tareaParaBackend = {
      nombre: this.nuevaTarea.nombre,
      descripcion: this.nuevaTarea.descripcion,
      prioridad: this.nuevaTarea.prioridad,
      estado: this.nuevaTarea.estado,
      fechaCreacion: this.nuevaTarea.fechaCreacion + 'T00:00:00',
      fechaFin: this.nuevaTarea.fechaFin + 'T00:00:00',
      horasEstimadas: this.nuevaTarea.horasEstimadas,
      usuarioId: this.nuevaTarea.usuarioId,       // <--- solo el ID
      iteracionId: this.nuevaTarea.iteracionId,   // <--- solo el ID
      categoriaIds: this.nuevaTarea.categoriaId
        ? [Number(this.nuevaTarea.categoriaId)] // <--- lista de IDs
        : []


    };

    console.log('Tarea a enviar:', tareaParaBackend);
    this.taskService.createTarea(tareaParaBackend).subscribe({
      next: (tareaCreada) => {
        this.tareas.push(tareaCreada);
        this.resetModal();
      },
      error: (err) => console.error(err)
    });
  }

  resetModal() {
    this.nuevaTarea = {
      nombre: '',
      descripcion: '',
      categoria: '',
      categoriaId: null,
      prioridad: 'Media',
      estado: 'Planificada',
      fechaCreacion: '',
      fechaFin: '',
      horasEstimadas: 0,
      usuarioId: 1,
      iteracionId: 7
    };

   
    this.cerrarModal();
  }

  tareasPorCategoria(): { [nombreCategoria: string]: number } {
  const contador: { [nombreCategoria: string]: number } = {};

  this.tareas.forEach(tarea => {
    tarea.categorias.forEach(cat => {
      if (contador[cat.nombre]) {
        contador[cat.nombre]++;
      } else {
        contador[cat.nombre] = 1;
      }
    });
  });

  return contador;
}
}
