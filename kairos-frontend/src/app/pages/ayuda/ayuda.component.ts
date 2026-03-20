import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from './safe-url.pipe';

interface PasoAyuda {
  titulo: string;
  descripcion: string;
  pasos?: string[];
  cierre?: string;
  videoUrl?: string;
}

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.css']
})
export class AyudaComponent {
  pasos: PasoAyuda[] = [
    //Primer paso
    {
      titulo: 'Bienvenido a Kairos',
      descripcion: 'En esta sección encontrarás los pasos para utilizar el sistema Kairos. Puedes agregar videos demostrativos debajo de cada explicación.'
    },
    {
      titulo: 'Iniciar Sesión',
      descripcion: 'Para acceder al sistema, el usuario debe seguir los siguientes pasos:',
      pasos: [
        'Acceder a la página <Dirección del sistema> desde un navegador.',
        'Hacer click en el botón “Iniciar sesión”.',
        'Al desplegarse la ventana emergente, debe seleccionar la cuenta previamente registrada en el sistema.',
        'Al realizar los pasos, el usuario ingresará a la pantalla inicial del sistema Kairos.'
      ],
      cierre: 'A continuación, puede observarse a través de un video demostrativo:',
      videoUrl: 'https://youtu.be/pAnGwRiQ4-4?si=GTtf3JUI7fYpM963' 
    },
    // Segundo paso
    {titulo: 'Menú de Usuario',
    descripcion:'En la esquina superior derecha, el usuario encontrará su foto de perfil y nombre. Al hacer click, se desplegará un menú con las siguientes opciones:',
    pasos: [
        'Ver Perfil: Permite al usuario visualizar su información personal y detalles de su cuenta.',
        'Cerrar sesión: Permite al usuario salir de su cuenta y regresar a la página de inicio de sesión.',
    ],
    cierre: 'A continuación, puede observarse a través de un video demostrativo:',
    videoUrl: 'https://youtu.be/pAnGwRiQ4-4?si=GTtf3JUI7fYpM963'
    },
    // Tercer paso
    {
        titulo: 'Administrador del sistema',
        descripcion:'En esta sección se detallarán las funciones especiales a las que tiene acceso el administrador del sistema Kairos, así como los pasos para acceder a las funcionalidades administrativas. \n Las demas funcionalidades restantes serán las mismas que un miembro de proyecto.',
        pasos: [
            'Módulo inicial',
            'El módulo de inicio es la primera pantalla que se visualiza al ingresar al sistema. En esta sección se muestran los proyectos activos del usuario',
            'En la barra de navegación del módulo inicial, en la vista del administrador encontramos:',
            'Proyectos: Permite al administrador visualizar y gestionar los proyectos del sistema',
            'Usuarios: Listado de todos los usuarios registrados en el sistema.',
            'Roles: Listado de todos los roles disponibles en el sistema.',
        ],
        cierre: 'A continuación, puede observarse a través de un video demostrativo:',
        videoUrl: 'https://youtu.be/pAnGwRiQ4-4?si=GTtf3JUI7fYpM963'
    }
  ];
}
