export interface Proyecto {
  idProyecto: number;
  nombre: string;
  equipo: string;
  descripcion: string;
  fechaInicio?: string;
  fechaCreacion: string;
  estado: string;
  logo?: string;
  usuariosProyecto?: Array<{
    idUsuario: number;
    nombre: string;
    email: string;
    rolProyecto: string;
  }>;
}