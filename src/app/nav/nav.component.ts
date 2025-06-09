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
  constructor(
  ) {}
  ngOnInit() {
    
  }
}
