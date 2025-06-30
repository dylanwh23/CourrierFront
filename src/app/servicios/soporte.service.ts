// src/app/servicios/contact.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupportRequest {
  name:    string;
  email:   string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class SupportService {
  // Si usas proxy:
  //private url = '/contact';
  // Si no usas proxy, pon el host completo:
   private url = 'http://localhost:8000/api/contact';

  constructor(private http: HttpClient) {}

 send(request: SupportRequest): Observable<{ status:string; message:string }> {
  return this.http.post<{ status:string; message:string }>(
    this.url,
    request,
    { withCredentials: true }  // muy importante si no usás sesión
  );
}
}