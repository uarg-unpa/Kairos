export interface Rol {
  id: number;
  nombre: string;
}
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol [];
}
