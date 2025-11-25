import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    constructor() { }

    success(title: string, text?: string) {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            confirmButtonColor: '#3085d6',
        });
    }

    error(title: string, text?: string) {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            confirmButtonColor: '#d33',
        });
    }

    warning(title: string, text?: string) {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            confirmButtonColor: '#f8bb86',
        });
    }

    info(title: string, text?: string) {
        return Swal.fire({
            icon: 'info',
            title: title,
            text: text,
            confirmButtonColor: '#3fc3ee',
        });
    }

    confirm(title: string, text: string, confirmButtonText: string = 'Sí, confirmar'): Promise<boolean> {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#31865aff',
            cancelButtonColor: '#d33',
            confirmButtonText: confirmButtonText,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            return result.isConfirmed;
        });
    }
}
