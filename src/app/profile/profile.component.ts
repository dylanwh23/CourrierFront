import { Component, inject, OnInit } from '@angular/core';
import { UsuarioService } from '../servicios/usuario.service';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { PaqueteService } from '../servicios/paquete.service';
import { CommonModule } from '@angular/common';
import { MisDatosComponent } from './profileSecciones/mis-datos/mis-datos.component';

@Component({
  selector: 'app-profile',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MisDatosComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']  // corregí aquí: es styleUrls, no styleUrl
})
export class ProfileComponent implements OnInit {
  public usuarioService = inject(UsuarioService);
  private paqueteService = inject(PaqueteService);
  private router = inject(Router);  // Inyectamos Router para navegar

  public currentUser$: Observable<User | null> = this.usuarioService.currentUser$;
  public isAuthenticated$: Observable<boolean> = this.usuarioService.isAuthenticated$;

  sidebarOpen = false;

  ngOnInit() {
    // Suscripción para debug
    this.currentUser$.subscribe(user => {
      if (user) {
        console.log('Current user:', user);
      } else {
        console.log('No user is currently logged in.');
      }
    });

    // Redirigir si NO está autenticado
    this.isAuthenticated$.subscribe(authenticated => {
      if (!authenticated) {
        this.router.navigate(['/login']);
      }
    });
  }

  onLogout() {
    this.usuarioService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        window.location.href = '/';
      },
      error: (err) => {
        console.error('Logout error:', err);
      }
    });
  }
}