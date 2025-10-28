export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string;
  proyecto?: any;
}

export interface Tarea {
  idTarea: number;
  nombre: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  fechaCreacion: string;
  fechaFin?: string;
  horasEstimadas?: number;
  usuarioNombre: string;
  usuarioRol: string;
  iteracionNumero: number;
  iteracionId: number;
  categorias: Categoria[];
  dependencias?: string[];
  notas?: string;
}
