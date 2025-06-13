import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class PaqueteService {

  private baseUrl = 'http://localhost:8000'; // Cambia por la URL real

  constructor(private http: HttpClient) {}

  listarPaquetesUsuario() {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.get(`${this.baseUrl}/listarPedidosUsuario`, { headers, withCredentials: true });
  }
}