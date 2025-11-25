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
  iteracionId: number;
  usuarioId: number;
  categorias: Categoria[];
  dependenciasIds?: number[];
  notas?: string;
  tiempoDedicado?: number; // Horas dedicadas (calculado en frontend)
}
