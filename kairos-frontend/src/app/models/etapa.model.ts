export interface Etapa {
  idEtapa: number;
  nombre: string;
  descripcion?: string;
  estado?: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
  fechaInicio?: string;
  fechaFin?: string;
  proyectoId?: number;
  progreso?: number;
  iteraciones?: number;
}
