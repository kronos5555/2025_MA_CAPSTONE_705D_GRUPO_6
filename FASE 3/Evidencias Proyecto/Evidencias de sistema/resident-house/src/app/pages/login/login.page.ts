import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, shieldCheckmark } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner
  ]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  role: 'resident' | 'conserje' = 'resident';
  loading: boolean = false;
  roleIcon: string = 'person';
  roleTitle: string = 'Residente';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({ person, shieldCheckmark });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.role = params['role'];
        this.roleIcon = this.role === 'resident' ? 'person' : 'shieldCheckmark';
        this.roleTitle = this.role === 'resident' ? 'Residente' : 'Conserje';
      }
    });
  }

  async login() {
    if (!this.email || !this.password) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return;
    }

    this.loading = true;

    try {
      const user = await this.authService.login(this.email, this.password);

      // Verificar que el rol coincida
      if (user.role !== this.role) {
        await this.authService.logout();
        this.showAlert('Error', `Esta cuenta no es de ${this.roleTitle}`);
        this.loading = false;
        return;
      }

      // Redirigir según el rol
      if (user.role === 'resident') {
        this.router.navigate(['/resident-home']);
      } else {
        this.router.navigate(['/conserje-home']);
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      let message = 'Error al iniciar sesión';
      
      if (error.code === 'auth/user-not-found') {
        message = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido';
      }

      this.showAlert('Error', message);
    } finally {
      this.loading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register'], {
      queryParams: { role: this.role }
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