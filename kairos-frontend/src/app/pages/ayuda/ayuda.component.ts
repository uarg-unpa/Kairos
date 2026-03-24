import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from './safe-url.pipe';

interface PasoAyuda {
  id: string;
  titulo: string;
  contenido: string[];
  tipo: 'info' | 'pasos' | 'tips';
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

  sidebarOpen = false;

  pasos: PasoAyuda[] = [
    {
      id: 'bienvenida',
      titulo: '👋 Bienvenido a Kairos',
      contenido: [
        'Kairos es un sistema para gestionar proyectos de software.',
        'Permite organizar tareas, equipos, tiempos y reportes en un solo lugar.'
      ],
      tipo: 'info'
    },
    {
      id: 'iniciar-sesion',
      titulo: '🔐 Iniciar sesión',
      contenido: [
        'Acceder a la página del sistema',
        'Hacer click en "Iniciar sesión"',
        'Seleccionar tu cuenta',
        'Ingresar al sistema'
      ],
      tipo: 'pasos',
      videoUrl: 'https://youtu.be/pAnGwRiQ4-4'
    },
    {
      id: 'navegacion',
      titulo: '🧭 Navegación principal',
      contenido: [
        'Inicio: resumen del proyecto',
        'Planificación: gestión de tareas',
        'Etapas: fases del proyecto',
        'Reportes: métricas y gráficos',
        'Espacio de trabajo: tareas personales'
      ],
      tipo: 'info'
    },
    {
      id: 'crear-tarea',
      titulo: '📝 Crear una tarea',
      contenido: [
        'Ir a "Planificación"',
        'Click en "Nueva tarea"',
        'Completar los datos',
        'Guardar'
      ],
      tipo: 'pasos'
    },
    {
      id: 'editar-tarea',
      titulo: '📝 Editar una tarea',
      contenido: [
        'Ir a "Planificación"',
        'Abrir el menú de la tarea',
        'Click en "Editar tarea"',
        'Completar los datos necesarios',
        'Guardar'
      ],
      tipo: 'pasos'
    },
    {
      id: 'eliminar-tarea',
      titulo: '❌ Eliminar una tarea',
      contenido: [
        'Ir a "Planificación"',
        'Abrir el menú de la tarea',
        'Seleccionar "Eliminar tarea"',
        'Confirmar la eliminación'
      ],
      tipo: 'pasos'
    },
    {
      id: 'cambiar-estado-tarea',
      titulo: '🔄 Cambiar el estado de una tarea',
      contenido: [
        'Abrir el menú de la tarea',
        'Seleccionar el estado',
        'Puede ser "En progreso" o "Completada"',
      ],
      tipo: 'pasos'
    },
    {
      id: 'comentarios-tarea',
      titulo: '💭 Comentarios',
      contenido: [
        '💠 Podés agregar comentarios a una tarea',
        '💠 Sirven para comunicarte con el equipo',
        '💠 También podés eliminarlos si es necesario'
      ],
      tipo: 'info'
    },
    {
      id: 'miembros',
      titulo: '👥 Miembros del equipo',
      contenido: [
        '💠 Podés ver los miembros del proyecto',
        '💠 Agregar nuevos miembros al equipo',
        '💠 Asignar roles dentro del proyecto',
        '💠 Eliminar miembros si es necesario'
      ],
      tipo: 'info'
    },
    {
      id: 'tips',
      titulo: 'Aclaraciones y consejos',
      contenido: [
        'Al agregar un miembro, se debe asignar un rol',
      ],
      tipo: 'tips'
    },
    {
      id: 'etapas-proyecto',
      titulo: '📊 Etapas del proyecto',
      contenido: [
        'Las etapas permiten dividir el proyecto en fases, permitiendo al usuario crear, editar y eliminar etapas según sea necesario',
        'Cada etapa tiene nombre, descripción y fechas, al eliminar una etapa, se elimina toda la información relacionada a esa etapa, incluyendo tareas, tiempos y reportes',
      ],
      tipo: 'info'
    },
    {
      id: 'iteraciones-proyecto',
      titulo: '📊 Iteraciones del proyecto',
      contenido: [
        'Cada etapa se divide en iteraciones, permitiendo organizar el trabajo en ciclos más pequeños, permitiendo al usuario crear, editar y eliminar iteraciones según sea necesario',
        'Cada iteración tiene nombre, descripción y fechas, al eliminar una iteración, se elimina toda la información relacionada a esa iteración, incluyendo tareas, tiempos y reportes',
      ],
      tipo: 'info'
    },
    {
      id: 'espacio-de-trabajo',
      titulo: '⏱️ Espacio de trabajo',
      contenido: [
        'Ir a "Espacio de trabajo"',
        'Seleccionar una tarea',
        'Iniciar el cronómetro para registrar el tiempo dedicado a la tarea',
        'Detener el cronómetro cuando termines',
        'El tiempo registrado se guardará automáticamente en la tarea'
      ],
      tipo: 'pasos'
    },
    {
      id: 'tips',
      titulo: '⚠️ Importante',
      contenido: [
        'No se puede crear tareas fuera de la iteración',
        'Las eliminaciones no se pueden deshacer',
        'Algunas funciones dependen de tu rol'
      ],
      tipo: 'tips'
    },
    {
      id: 'reportes',
      titulo: '📈 Reportes y métricas',
      contenido: [
        'En esta sección podrás ver gráficos y métricas sobre el progreso del proyecto, tiempos registrados, tareas completadas y más',
        'Incluye métricas como tareas atrasadas y próximos vencimientos',
        'La información se puede filtrar por etapa, iteración o período de tiempo',
      ],
      tipo: 'info'
    },
    {
      id: 'tips',
      titulo: '⚠️ Importante',
      contenido: [
        'Kairos permite la exportación de los datos de cada proyecto para su posterior análisis',
      ],
      tipo: 'tips'
    },
    {
      id: 'tips',
      titulo: '⁉️ Preguntas frecuentes',
      contenido: [
        '¿Puedo estar en varios proyectos?',
        'Sí, puedes ser miembro de varios proyectos y cambiar entre ellos fácilmente.',
        '¿Puedo asignar más de un responsable a una tarea?',
        'No, cada tarea solo puede tener un responsable asignado.',
        'Se actualizan los reportes?'
        ,'Sí, los reportes se acualizan en tiempo real',
        'Puedo eliminar un proyecto?,',
        'Sí, siendo un administrador del proyecto, puedes eliminarlo desde la configuración del proyecto, pero ten cuidado, esta acción no se puede deshacer y eliminará toda la información relacionada al proyecto.',
        '¿No veo algunas opciones?',
        'Algunas funciones solo están disponibles para ciertos roles, como administradores o líder de proyecto.'
      ],
      tipo: 'tips'
    }
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.sidebarOpen = false;
    }
  }
}