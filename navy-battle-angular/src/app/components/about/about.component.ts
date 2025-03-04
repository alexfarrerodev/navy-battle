import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-battleship-about',
  templateUrl: './about.component.html',
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('300ms ease-out', 
          style({ opacity: 1, transform: 'scaleY(1)' })
        )
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
          style({ opacity: 0, transform: 'scaleY(0)' })
        )
      ])
    ])
  ]
})

export class AboutComponent {
  showInstructions = false;

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }
}
