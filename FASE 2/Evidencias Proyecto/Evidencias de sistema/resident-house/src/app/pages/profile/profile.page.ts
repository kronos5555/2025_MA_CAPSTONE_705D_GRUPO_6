import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  person, 
  mail, 
  call, 
  home, 
  location, 
  shieldCheckmark,
  camera,
  create
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class ProfilePage implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController
  ) {
    addIcons({ 
      person, 
      mail, 
      call, 
      home, 
      location, 
      shieldCheckmark,
      camera,
      create
    });
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  async loadUserData() {
    this.user = await this.authService.getCurrentUserData();
  }

  async changePhoto() {
    const alert = await this.alertController.create({
      header: 'Cambiar Foto',
      message: 'Esta funcionalidad estará disponible próximamente',
      buttons: ['OK']
    });
    await alert.present();
  }

  async editProfile() {
    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      message: 'Esta funcionalidad estará disponible próximamente',
      buttons: ['OK']
    });
    await alert.present();
  }
}