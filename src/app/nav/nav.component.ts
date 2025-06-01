import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../servicios/usuario.service';
@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  private isLoggedIn: boolean = false;
  private userName: string = '';
  constructor(
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

}
