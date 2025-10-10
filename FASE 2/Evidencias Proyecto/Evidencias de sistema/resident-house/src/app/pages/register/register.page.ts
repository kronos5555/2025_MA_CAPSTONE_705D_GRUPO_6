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
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, shieldCheckmark } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
export class RegisterPage implements OnInit {
  displayName: string = '';
  email: string = '';
  apartmentNumber: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: 'resident' | 'conserje' = 'resident';
  loading: boolean = false;
  roleIcon: string = 'person';
  roleTitle: string = 'Residente';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertController: AlertController
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

  async register() {
    // Validaciones
    if (!this.displayName || !this.email || !this.password || !this.confirmPassword) {
      this.showAlert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!this.displayName.trim()) {
      this.showAlert('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showAlert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 6) {
      this.showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading = true;

    try {
      await this.authService.register(this.email, this.password, {
        displayName: this.displayName.trim(),
        role: this.role,
        apartmentNumber: this.apartmentNumber.trim()
      });

      this.showAlert('Éxito', 'Cuenta creada exitosamente', () => {
        // Redirigir según el rol
        if (this.role === 'resident') {
          this.router.navigate(['/resident-home']);
        } else {
          this.router.navigate(['/conserje-home']);
        }
      });
    } catch (error: any) {
      console.error('Error en registro:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      
      let message = 'Error al crear la cuenta';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este email ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El formato del email es inválido';
      } else if (error.code === 'auth/weak-password') {
        message = 'La contraseña es muy débil. Debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'El registro con email/contraseña no está habilitado';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Error de conexión. Verifica tu internet';
      } else {
        message = `Error: ${error.message}`;
      }

      this.showAlert('Error', message);
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login'], {
      queryParams: { role: this.role }
    });
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