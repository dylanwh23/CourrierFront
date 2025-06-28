import { CommonModule, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../servicios/usuario.service';
import { User } from '../interfaces/user.interface'; 

// Asegúrate de que este modelo exista y sea correcto
@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, NgIf, CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  private usuarioService = inject(UsuarioService);
  currentUser$: Observable<User | null> = this.usuarioService.currentUser$;
  isAuthenticated$: Observable<boolean> = this.usuarioService.isAuthenticated$;
    public isMenuOpen = false;

  // Ejemplo de cómo podrías estar obteniendo el estado de autenticación
  // constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // this.isAuthenticated$ = this.authService.isAuthenticated(); // Descomenta y ajusta
  }

  /**
   * Cambia el estado de la variable isMenuOpen para mostrar u ocultar el menú móvil.
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Cierra el menú móvil. Es útil llamarlo cuando se hace clic en un enlace
   * para que el menú se cierre automáticamente después de la navegación.
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }
  constructor(
  ) {}
  
}
