import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonButton, 
  IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, shieldCheckmark } from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon
  ]
})
export class WelcomePage {
  constructor(private router: Router) {
    addIcons({ home, person, shieldCheckmark });
  }

  goToLogin(role: 'resident' | 'conserje') {
    this.router.navigate(['/login'], { 
      queryParams: { role } 
    });
  }
}