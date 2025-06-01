import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


export interface RegisterData {
  correo: string;
  pass: string;
  cedula: string;
  fechaNacimiento: string;
  nombre: string;
  apellido: string;
}


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8000/api';
  private http = inject(HttpClient);
  altaUsuario(data: RegisterData) : Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }
  login(data: { email: string; password: string }) {
    return this.http.post(this.apiUrl + '/login/', data, { withCredentials: true });
  }
  logout(): Observable<any> {
    return this.http.post(this.apiUrl + '/logout/', {}, { withCredentials: true })
      .pipe(tap(() => {
        // Clear any user data or tokens if necessary
      }));
  }
}