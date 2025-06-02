import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
//Creado por Gemini, no me funciono el seteo automatic de cookies con witInterceptors xD

// Función auxiliar para leer la cookie XSRF-TOKEN
// La moví aquí para que el interceptor sea autocontenido
function getXsrfTokenFromCookie(): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]+)'));
  // decodeURIComponent es importante si el token tiene caracteres especiales
  return match ? decodeURIComponent(match[2]) : null; 
}

export const manualXsrfInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn // 'next' es la función para pasar la petición al siguiente manejador en la cadena
): Observable<HttpEvent<unknown>> => {

  // Definimos la URL base de tu API para no añadir la cabecera a URLs externas
  const apiUrlBase = 'http://localhost:8000'; // La URL de tu API Laravel

  // Verificamos si la petición es a tu API, si usa credenciales y si es un método que modifica estado
  const isApiUrl = req.url.startsWith(apiUrlBase);
  const shouldAttachToken = req.withCredentials && isApiUrl && 
                            (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH');

  if (!shouldAttachToken) {
    // Si no es una petición que necesite el token, la pasamos sin modificar
    return next(req);
  }

  // Obtenemos el token de la cookie
  const token = getXsrfTokenFromCookie();

  if (token) {
    // Si encontramos el token, clonamos la petición para añadir la nueva cabecera
    // Es importante clonar porque las instancias de HttpRequest son inmutables
    const clonedReq = req.clone({
      headers: req.headers.set('X-XSRF-TOKEN', token),
    });
    console.log('[ManualXsrfInterceptor] X-XSRF-TOKEN header added to:', req.url);
    return next(clonedReq); // Pasamos la petición clonada con la nueva cabecera
  } else {
    // Si no se encuentra el token, podrías querer manejar este caso.
    // Por ahora, solo advertimos y pasamos la petición original.
    // En una app en producción, podrías querer lanzar un error o reintentar obtener el token CSRF.
    console.warn('[ManualXsrfInterceptor] XSRF-TOKEN cookie not found for state-changing request to:', req.url);
    return next(req);
  }
};