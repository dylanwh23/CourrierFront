import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../servicios/usuario.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink, NgIf, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  mensaje: string = '';
  errores: { [key: string]: string[] } = {};

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      console.log(formData);
      this.usuarioService.login(formData).subscribe({
        next: (res) => {
          this.mensaje = 'Inicio de sesión exitoso';
          console.log(res);
          // Verifica si es agente y redirige según corresponda
          this.usuarioService.esAgente().subscribe({
            next: (resp) => {
              if (resp.es_agente) {
                this.router.navigate(['/soportechat']);
              } else {
                this.router.navigate(['/']);
              }
            },
            error: () => {
              // Si hay error en la verificación, redirige a home por defecto
              this.router.navigate(['/']);
            }
          });
        },
        error: (err) => {
          if (err.status === 401) {
            this.mensaje = 'Credenciales inválidas';
          } else {
            this.mensaje = 'Error inesperado durante el inicio de sesión';
          }
          console.error(err);
        }
      });
    } else {
      this.mensaje = 'Por favor, complete todos los campos requeridos correctamente.';
    }

  }
}
