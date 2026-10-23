import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vacunacion',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vacunacion.component.html',
  styleUrl: '../salud/salud.component.scss'
})
export class VacunacionComponent {}
