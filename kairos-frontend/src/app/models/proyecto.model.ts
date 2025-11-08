export interface Proyecto {
  idProyecto: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fechaCreacion: string;
  equipo: string;
  logo?: string; // opcional
}