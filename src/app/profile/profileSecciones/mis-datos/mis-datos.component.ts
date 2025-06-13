import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-mis-datos',
  imports: [],
  templateUrl: './mis-datos.component.html',
  styleUrl: './mis-datos.component.css'
})
export class MisDatosComponent {
  @HostBinding('class') classes = 'flex flex-col min-h-5/6 min-w-5/6 bg-white mx-auto p-4 rounded-lg shadow-lg'
}
