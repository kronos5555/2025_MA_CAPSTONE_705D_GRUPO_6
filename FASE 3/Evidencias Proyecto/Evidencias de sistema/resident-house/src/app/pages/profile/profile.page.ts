import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  person, 
  mail, 
  home, 
  shieldCheckmark,
  camera,
  create,
  arrowBack
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
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner
  ]
})
export class ProfilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  user: User | null = null;
  uploadingPhoto: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({ 
      person, 
      mail, 
      home, 
      shieldCheckmark,
      camera,
      create,
      arrowBack
    });
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  async loadUserData() {
    this.user = await this.authService.getCurrentUserData();
  }

  changePhoto() {
    // Disparar el click en el input file oculto
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      await this.showAlert('Error', 'Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      await this.showAlert('Error', 'La imagen no debe superar los 5MB');
      return;
    }

    await this.uploadPhoto(file);
  }

  async uploadPhoto(file: File) {
    const loading = await this.loadingController.create({
      message: 'Subiendo foto...',
      spinner: 'crescent'
    });
    await loading.present();

    this.uploadingPhoto = true;

    try {
      const userId = this.authService.getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      // Subir foto y obtener URL
      const photoURL = await this.userService.uploadProfilePhoto(userId, file);

      // Actualizar datos locales
      if (this.user) {
        this.user.photoURL = photoURL;
      }

      await loading.dismiss();
      await this.showAlert('Éxito', 'Foto de perfil actualizada correctamente');
    } catch (error) {
      console.error('Error subiendo foto:', error);
      await loading.dismiss();
      await this.showAlert('Error', 'No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      this.uploadingPhoto = false;
      // Limpiar el input file
      this.fileInput.nativeElement.value = '';
    }
  }

  async editProfile() {
    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      message: 'Esta funcionalidad estará disponible próximamente',
      buttons: ['OK']
    });
    await alert.present();
  }

  goBack() {
    // Regresar al home según el rol
    if (this.user?.role === 'resident') {
      this.router.navigate(['/resident-home']);
    } else {
      this.router.navigate(['/conserje-home']);
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}