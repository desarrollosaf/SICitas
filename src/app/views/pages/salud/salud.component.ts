import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-salud',
  imports: [CommonModule, RouterLink],
  templateUrl: './salud.component.html',
  styleUrl: './salud.component.scss'
})
export class SaludComponent {
  mostrarMasculina = true;
  mostrarMastografias = true;

  constructor(private route: ActivatedRoute) {
    const tipo = this.route.snapshot.paramMap.get('tipo');
    if (tipo === 'masculina') {
      this.mostrarMastografias = false;
    } else if (tipo === 'mastografias') {
      this.mostrarMasculina = false;
    }
  }
}
