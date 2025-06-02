import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UsuarioService } from '../servicios/usuario.service';
import { NgFor, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, NgFor, CommonModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  userForm!: FormGroup;
  mensaje: string = '';
  errores: { [key: string]: string[] } = {};
  usuarioCreado: boolean = false;
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_email: ['', [Validators.required, Validators.email]],
      date_of_birth: ['', [Validators.required]],
      cedula: ['', [Validators.required]],
    });
  }
  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      console.log(formData);
      if (formData.password !== formData.confirm_password) {
        this.errores['password'] = ['Las contraseñas no coinciden'];
        return;
      }
      if (formData.email !== formData.confirm_email) {
        this.errores['email'] = ['Los correos no coinciden'];
        return;
      }

      this.usuarioService.altaUsuario(formData).subscribe({
        next: (res) => {
          this.mensaje = 'Usuario registrado correctamente';
          console.log(res);
          this.usuarioCreado = true;
        },
        error: (err) => {
          if (err.status === 422) {
            this.errores = err.error.errors; // Esto es un objeto con los errores por campo
          } else {
            this.mensaje = 'Error inesperado en el registro';
          }
        },
      });
    } else {
      console.log('Formulario inválido');
    }
  }
}
