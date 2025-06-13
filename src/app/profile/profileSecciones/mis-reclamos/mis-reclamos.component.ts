import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-mis-reclamos',
  imports: [],
  templateUrl: './mis-reclamos.component.html',
  styleUrl: './mis-reclamos.component.css'
})
export class MisReclamosComponent {
  @HostBinding('class') classes = 'flex flex-col min-h-5/6 min-w-5/6 bg-white mx-auto p-4 rounded-lg shadow-lg'

}
