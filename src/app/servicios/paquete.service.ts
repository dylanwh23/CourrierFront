import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PaqueteService {

  private baseUrl = 'http://localhost:8000'; // Cambia por la URL real

  constructor(private http: HttpClient) {}

  altaOrden(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/altaOrden`, data, { withCredentials: true });
  }
  getOrdenes(user_id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/ordenes/`+user_id, { withCredentials: true });
  }
  altaCompra(data: any, orden_id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/createCompra/`+orden_id, data, { withCredentials: true });
  }
  confirmarEnvioOrden(compra_id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/confirmarEnvioOrden/` + compra_id, {}, { withCredentials: true });
  }
  confirmarRecepcionCompra(compra_id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/confirmarRecepcionCompra/` + compra_id, {}, { withCredentials: true });
  }
}