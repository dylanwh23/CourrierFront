// src/app/usuario.service.ts (o como lo hayas llamado)
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs'; // Importa BehaviorSubject
import { tap, catchError, switchMap, map } from 'rxjs/operators'; // Importa map
import { User } from '../interfaces/user.interface'; // Asegúrate de que este modelo exista y sea correcto
// Define una interfaz para tu usuario (ajusta según los datos que devuelve tu API)
export interface RegisterData {
  correo: string; // Si tu backend espera 'correo' para registrar
  pass: string;
  cedula: string;
  fechaNacimiento: string;
  nombre: string;
  apellido: string;
}

export interface LoginData {
  email: string; // Asegúrate que esto coincida con lo que espera tu backend (usualmente 'email')
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8000';
  private http = inject(HttpClient);

  // BehaviorSubject para almacenar el usuario actual. Inicializa en null (no logueado).
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  // Observable público para que los componentes se suscriban y reaccionen a cambios.
  public currentUser$ = this.currentUserSubject.asObservable();
  // Observable para saber fácilmente si el usuario está autenticado.
  public isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => !!user)
  );

  constructor() {
    // Opcional: Intenta cargar el usuario al iniciar el servicio
    // Esto es útil si el usuario ya tiene una sesión activa en el backend
    // y recarga la página.
    this.fetchCurrentUser().subscribe();
  }

  // Getter para acceder al valor actual del usuario de forma síncrona (úsalo con cuidado)
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  altaUsuario(data: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data, {
      withCredentials: true,
    });
  }

  getCsrfToken() {
    return this.http.get(`${this.apiUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  }

  // En UsuarioService, método login() - si /login NO devuelve datos de usuario
  login(data: LoginData): Observable<User> {
    // O podría devolver Observable<void> y luego llamar a fetchCurrentUser
    return this.getCsrfToken().pipe(
      switchMap(
        () =>
          this.http.post<any>(`${this.apiUrl}/login`, data, {
            withCredentials: true,
          }) // Asume que /login devuelve { success: true } o similar
      ),
      switchMap(() => {
        // Después de login exitoso, llama a fetchCurrentUser
        return this.fetchCurrentUser().pipe(
          map((user) => {
            if (!user) {
              // Si fetchCurrentUser devuelve null (ej. por un error inesperado después de login)
              throw new Error(
                'No se pudieron obtener los datos del usuario después del login.'
              );
            }
            return user; // Devuelve el usuario para que el componente lo reciba
          })
        );
      }),
      catchError((error) => {
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http
      .post<any>(this.apiUrl + '/logout', {}, { withCredentials: true }) // Quité la barra final si no la usas consistentemente
      .pipe(
        tap(() => {
          // Cuando el logout es exitoso, actualizamos el BehaviorSubject a null
          this.currentUserSubject.next(null);
          console.log('Usuario deslogueado');
          // Opcional: Limpiar localStorage
          // localStorage.removeItem('currentUser');
        }),
        catchError((error) => {
          // Incluso si el logout falla, es buena idea limpiar el estado del cliente
          this.currentUserSubject.next(null);
          // localStorage.removeItem('currentUser');
          return throwError(() => error);
        })
      );
  }

  // Nuevo método para obtener el usuario actual del backend
  fetchCurrentUser(): Observable<User | null> {
    return this.http
      .get<User>(`${this.apiUrl}/user`, { withCredentials: true })
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
          // localStorage.setItem('currentUser', JSON.stringify(user));
        }),
        catchError((error) => {
          // Si hay un error (ej. 401 No Autenticado), significa que no hay sesión válida
          this.currentUserSubject.next(null);
          // localStorage.removeItem('currentUser');
          // No relanzamos el error si es un 401/403 esperado al chequear,
          // simplemente devolvemos null o un observable de null.
          // Si quieres propagar el error para otros manejos, usa throwError.
          return new Observable<null>((observer) => observer.next(null));
        })
      );
  }
}
