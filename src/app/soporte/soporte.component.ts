import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupportService, SupportRequest } from '../servicios/soporte.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-support',
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css'],
  imports: [ReactiveFormsModule, CommonModule] 
})
export class SoporteComponent implements OnInit {
  form!: FormGroup;
  submitting = false;
  errorMsg = '';
  successMsg = '';
  

  constructor(
    private fb: FormBuilder,
    private supportService: SupportService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
  this.submitting = true;
  this.errorMsg = '';
  this.successMsg = '';

  if (this.form.invalid) {
    this.submitting = false;
    return;
  }

  const payload: SupportRequest = this.form.value;
  this.supportService.send(payload).subscribe({
    next: res => {
      console.log('RESPUESTA DEL BACKEND:', res);
      this.successMsg = res.message; // "Consulta recibida. Revisa tu correo…"
      this.form.reset();
      this.submitting = false;
    },
    error: err => {
      console.error(err);
      this.errorMsg = 'Hubo un error enviando tu mensaje.';
      this.submitting = false;
    }
  });
}

}
