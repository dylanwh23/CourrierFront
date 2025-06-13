import { Component, inject } from '@angular/core';
import { UsuarioService } from '../servicios/usuario.service';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
 // Asegúrate de que este modelo exista y sea correcto

@Component({
  selector: 'app-profile',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
    
})
export class ProfileComponent {
  private usuarioService = inject(UsuarioService);
  currentUser$: Observable<User | null> = this.usuarioService.currentUser$;
  isAuthenticated$: Observable<boolean> = this.usuarioService.isAuthenticated$;
  onLogout() {
    this.usuarioService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        // Aquí podrías redirigir al usuario a la página de inicio o login
        window.location.href = '/';
      },
      error: (err) => {
        console.error('Logout error:', err);
      }
    });
  }

}
