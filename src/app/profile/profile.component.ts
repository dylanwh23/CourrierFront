import { Component, inject, OnInit } from '@angular/core';
import { UsuarioService } from '../servicios/usuario.service';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { PaqueteService } from '../servicios/paquete.service';
import { CommonModule } from '@angular/common';
import { MisDatosComponent } from './profileSecciones/mis-datos/mis-datos.component';
 // Asegúrate de que este modelo exista y sea correcto

@Component({
  selector: 'app-profile',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MisDatosComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
    
})
export class ProfileComponent implements OnInit {
  public usuarioService = inject(UsuarioService);
  private paqueteService = inject(PaqueteService); // Asegúrate de que este servicio sea correcto
  public currentUser$: Observable<User | null> = this.usuarioService.currentUser$;
  public isAuthenticated$: Observable<boolean> = this.usuarioService.isAuthenticated$;
  sidebarOpen = false;
  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
        console.log('Current user:', user);
      } else {
        console.log('No user is currently logged in.');
      }
    });

  }

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
