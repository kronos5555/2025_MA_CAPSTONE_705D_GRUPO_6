import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  close,
  send,
  image,
  closeCircle
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { AnuncioService } from '../../services/anuncio.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-create-anuncio',
  templateUrl: './create-anuncio.page.html',
  styleUrls: ['./create-anuncio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSpinner
  ]
})
export class CreateAnuncioPage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  anuncio = {
    title: '',
    description: '',
    category: 'announcement'
  };

  selectedImage: File | null = null;
  imagePreview: string | null = null;
  uploading: boolean = false;
  uploadingMessage: string = '';
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private anuncioService: AnuncioService,
    private alertController: AlertController
  ) {
    addIcons({ 
      close,
      send,
      image,
      closeCircle
    });
    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    this.currentUser = await this.authService.getCurrentUserData();
  }

  selectImage() {
    this.fileInput.nativeElement.click();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      this.showAlert('Error', 'Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showAlert('Error', 'La imagen no debe superar los 5MB');
      return;
    }

    this.selectedImage = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.fileInput.nativeElement.value = '';
  }

  isFormValid(): boolean {
    return this.anuncio.title.trim().length > 0 && 
           this.anuncio.description.trim().length > 0;
  }

  async publishAnuncio() {
    if (!this.isFormValid()) {
      await this.showAlert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    this.uploading = true;

    try {
      let imageUrl: string | undefined = undefined;

      // Subir imagen SOLO si existe
      if (this.selectedImage) {
        try {
          this.uploadingMessage = 'Subiendo imagen...';
          imageUrl = await this.anuncioService.uploadAnuncioImage(this.selectedImage);
        } catch (error) {
          console.error('Error subiendo imagen:', error);
          // Si falla la imagen, preguntar si continuar sin ella
          const continuar = await this.confirmPublishWithoutImage();
          if (!continuar) {
            this.uploading = false;
            return;
          }
        }
      }

      // Crear anuncio (con o sin imagen)
      this.uploadingMessage = 'Publicando anuncio...';
      
      await this.anuncioService.createAnuncio({
        title: this.anuncio.title.trim(),
        description: this.anuncio.description.trim(),
        imageUrl: imageUrl, // Puede ser undefined
        authorId: this.currentUser?.uid || '',
        authorName: this.currentUser?.displayName || 'Usuario',
        authorPhoto: this.currentUser?.photoURL,
        authorRole: this.currentUser?.role || 'resident',
        category: this.anuncio.category as any,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await this.showAlert('Éxito', 'Anuncio publicado correctamente', () => {
        this.router.navigate(['/anuncios']);
      });
    } catch (error) {
      console.error('Error publicando anuncio:', error);
      await this.showAlert('Error', 'No se pudo publicar el anuncio. Intenta de nuevo.');
    } finally {
      this.uploading = false;
      this.uploadingMessage = '';
    }
  }

  async confirmPublishWithoutImage(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Error con la imagen',
        message: 'No se pudo subir la imagen. ¿Deseas publicar el anuncio sin imagen?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Publicar sin imagen',
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }

  goBack() {
    if (this.uploading) {
      return;
    }

    if (this.anuncio.title || this.anuncio.description || this.selectedImage) {
      this.confirmCancel();
    } else {
      this.router.navigate(['/anuncios']);
    }
  }

  async confirmCancel() {
    const alert = await this.alertController.create({
      header: 'Descartar Anuncio',
      message: '¿Estás seguro? Se perderán los cambios.',
      buttons: [
        {
          text: 'Continuar Editando',
          role: 'cancel'
        },
        {
          text: 'Descartar',
          role: 'destructive',
          handler: () => {
            this.router.navigate(['/anuncios']);
          }
        }
      ]
    });

    await alert.present();
  }

  async showAlert(header: string, message: string, callback?: () => void) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [{
        text: 'OK',
        handler: () => {
          if (callback) callback();
        }
      }]
    });
    await alert.present();
  }
}