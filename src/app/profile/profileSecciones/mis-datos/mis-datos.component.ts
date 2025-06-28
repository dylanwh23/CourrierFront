import { Component, HostBinding, Input, OnInit, inject } from '@angular/core';
import { UsuarioService } from '../../../servicios/usuario.service';
import { User } from '../../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-mis-datos',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './mis-datos.component.html',
  styleUrl: './mis-datos.component.css',
})
export class MisDatosComponent implements OnInit {
  @HostBinding('class') classes =
    'flex flex-col min-h-5/6 min-w-5/6 bg-white mx-auto p-4 rounded-lg shadow-lg';
  public usuarioService = inject(UsuarioService);
  userData: User | null = null;
  showPasswordForm: boolean = false;
  cambiarContrasenaForm!: FormGroup;
  mensaje: string = '';
  errores: { [key: string]: string[] } = {};


  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.usuarioService.currentUser$.subscribe((user) => {
      if (user) {
        this.userData = { ...user };
      }
    });

    this.cambiarContrasenaForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirmarNuevaContraseña: [
        '',
        [Validators.required, Validators.minLength(8)],
      ],
    });
  }

  onSubmit() {
    if (this.cambiarContrasenaForm.valid) {
      const formData = this.cambiarContrasenaForm.value;
      const data = {
        current_password: String(formData.current_password),
        new_password: String(formData.new_password),
        confirm_new_password: String(formData.confirmarNuevaContraseña),
      };
      console.log(data);
      this.usuarioService
        .cambiarContraseña(data
        )
        .subscribe({
          next: (res) => {
            this.mensaje = 'Contraseña cambiada correctamente';
          },
          error: (err) => {
            this.mensaje = 'Error al cambiar la contraseña: ' + err.error.message;
          },
        });
    } else {
      this.mensaje = 'Por favor, completa todos los campos correctamente.';
    }
  }
}
