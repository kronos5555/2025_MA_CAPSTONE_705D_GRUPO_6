import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-create-anuncio',
  templateUrl: './create-anuncio.page.html',
  styleUrls: ['./create-anuncio.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CreateAnuncioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
