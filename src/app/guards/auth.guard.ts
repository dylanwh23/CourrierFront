// src/app/guards/auth.guard.ts (o donde lo hayas generado)

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UsuarioService } from '../servicios/usuario.service'; // Asegúrate de que esta ruta sea correcta para tu AuthService

export const authGuard: CanActivateFn = (route, state) => {
  // Inyecta el AuthService y el Router usando la función `inject`
  // Esto es equivalente a inyectar en el constructor de una clase
  const authService = inject(UsuarioService);
  const router = inject(Router);

  if (authService.isLoggedIn()) { // Asume que tu AuthService tiene un método isLoggedIn()
    return true; // Permite el acceso a la ruta
  } else {
    // Si el usuario no está autenticado, redirige a la página de login
    router.navigate(['/login']);
    return false; // Niega el acceso a la ruta
  }
};