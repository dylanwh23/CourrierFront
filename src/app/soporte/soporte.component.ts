import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupportService, SupportRequest } from '../servicios/soporte.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
@Component({
  selector: 'app-support',
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css'],
  imports: [ReactiveFormsModule, NgIf] 
})
export class SoporteComponent implements OnInit {
  form!: FormGroup;
  submitting = false;
  errorMsg = '';

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

    if (this.form.invalid) {
      this.submitting = false;
      return;
    }

    const payload: SupportRequest = this.form.value;
    this.supportService.send(payload).subscribe({
      next: res => {
        alert(res.message);        // “Consulta recibida. Revisa tu correo…”
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
