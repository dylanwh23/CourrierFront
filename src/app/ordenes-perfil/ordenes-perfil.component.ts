import { Component, OnInit } from '@angular/core';
import { PaqueteService } from '../servicios/paquete.service';
import { CommonModule } from '@angular/common'; 

@Component({
    selector: 'app-ordenes-perfil', 
    standalone: true,
    templateUrl: './ordenes-perfil.component.html',
  styleUrls: ['./ordenes-perfil.component.css'],
  imports: [CommonModule]
})
export class OrdenesPerfilComponent implements OnInit {
  paquetes: any[] = [];

  constructor(private paqueteService: PaqueteService) {}

  ngOnInit() {
    this.cargarPaquetes();
  }

  cargarPaquetes() {
   this.paqueteService.listarPaquetesUsuario().subscribe({
  next: (paquetes) => {
    this.paquetes = paquetes as any[];
  },
  error: (err: any) => {
    console.error(err);
  }
});
  }
}