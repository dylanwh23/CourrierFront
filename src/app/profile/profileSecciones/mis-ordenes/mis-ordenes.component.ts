import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-mis-ordenes',
  imports: [],
  templateUrl: './mis-ordenes.component.html',
  styleUrl: './mis-ordenes.component.css'
})
export class MisOrdenesComponent {
  @HostBinding('class') classes = 'flex flex-col min-h-5/6 min-w-5/6 bg-white mx-auto p-4 rounded-lg shadow-lg'

}
