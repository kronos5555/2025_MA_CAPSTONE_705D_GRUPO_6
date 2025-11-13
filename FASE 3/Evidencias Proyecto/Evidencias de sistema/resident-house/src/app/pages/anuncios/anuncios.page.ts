import { Component, OnInit } from '@angular/core';
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonAvatar,
  IonBadge,
  IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBack,
  addCircle,
  megaphoneOutline,
  calendarOutline,
  trash
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { AnuncioService } from '../../services/anuncio.service';
import { Anuncio } from '../../models/anuncio.model';

@Component({
  selector: 'app-anuncios',
  templateUrl: './anuncios.page.html',
  styleUrls: ['./anuncios.page.scss'],
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonAvatar,
    IonBadge,
    IonSpinner
  ]
})
export class AnunciosPage implements OnInit {
  anuncios: Anuncio[] = [];
  loading: boolean = true;
  currentUserId: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private anuncioService: AnuncioService,
    private alertController: AlertController
  ) {
    addIcons({ 
      arrowBack,
      addCircle,
      megaphoneOutline,
      calendarOutline,
      trash
    });
  }

  async ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId();
    await this.loadAnuncios();
  }

  ionViewWillEnter() {
    // Recargar anuncios cada vez que se entra a la página
    this.loadAnuncios();
  }

  async loadAnuncios() {
    this.loading = true;
    try {
      this.anuncios = await this.anuncioService.getAllAnuncios();
      console.log('Anuncios cargados:', this.anuncios.length);
    } catch (error) {
      console.error('Error cargando anuncios:', error);
      this.showAlert('Error', 'No se pudieron cargar los anuncios');
    } finally {
      this.loading = false;
    }
  }

  createAnuncio() {
    this.router.navigate(['/create-anuncio']);
  }

  async deleteAnuncio(anuncio: Anuncio) {
    const alert = await this.alertController.create({
      header: 'Eliminar Anuncio',
      message: `¿Estás seguro de eliminar "${anuncio.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.anuncioService.deleteAnuncio(anuncio.id!);
              await this.showAlert('Éxito', 'Anuncio eliminado correctamente');
              await this.loadAnuncios();
            } catch (error) {
              console.error('Error eliminando anuncio:', error);
              await this.showAlert('Error', 'No se pudo eliminar el anuncio');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'lost': 'danger',
      'found': 'success',
      'event': 'warning',
      'announcement': 'primary',
      'other': 'medium'
    };
    return colors[category] || 'medium';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'lost': 'Perdido',
      'found': 'Encontrado',
      'event': 'Evento',
      'announcement': 'Aviso',
      'other': 'Otro'
    };
    return labels[category] || 'Otro';
  }

  goBack() {
    this.authService.getCurrentUserData().then(user => {
      if (user?.role === 'resident') {
        this.router.navigate(['/resident-home']);
      } else {
        this.router.navigate(['/conserje-home']);
      }
    });
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