import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios';
import { Usuario } from '../../models/usuarios';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.obtenerUsuarios().subscribe(data => {
      this.usuarios = data;
    });
  }
}
