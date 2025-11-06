import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Iteracion } from '../models/iteracion.model';

@Injectable({
    providedIn: 'root'
})
export class IteracionService {
    private baseUrl = 'http://localhost:8080/api/iteraciones';
    constructor(private http: HttpClient) { }


    getIteraciones(): Observable<Iteracion[]> {
        return this.http.get<Iteracion[]>(this.baseUrl);
    }
}