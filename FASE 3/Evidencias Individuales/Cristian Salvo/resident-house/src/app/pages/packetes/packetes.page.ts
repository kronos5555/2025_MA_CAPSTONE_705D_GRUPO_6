import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonBadge,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonModal,
  IonInput,
  IonTextarea,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircle,
  clipboardOutline,
  cube,
  home,
  person,
  archive,
  documentText,
  logIn,
  logOut,
  trash
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { PacketesService } from '../../services/packetes.service';
import { PacketeEntry } from '../../models/packete.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-packetes',
  templateUrl: './packetes.page.html',
  styleUrls: ['./packetes.page.scss'],
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
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonSearchbar,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonModal,
    IonInput,
    IonTextarea
  ]
})
export class PacketesPage implements OnInit {
  packetes: PacketeEntry[] = [];
  filteredPacketes: PacketeEntry[] = [];
  loading: boolean = true;
  saving: boolean = false;
  isModalOpen: boolean = false;
  filterType: string = 'all';
  searchTerm: string = '';
  currentUser: User | null = null;

  newPackete: Partial<PacketeEntry> = {
    recipientName: '',
    trackingCode: '',
    apartment: '',
    carrier: '',
    storageLocation: '',
    notes: ''
  };

  constructor(
    private packetesService: PacketesService,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    addIcons({
      addCircle,
      clipboardOutline,
      cube,
      home,
      person,
      archive,
      documentText,
      logIn,
      logOut,
      trash
    });
  }

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadPacketes();
  }

  async loadCurrentUser() {
    this.currentUser = await this.authService.getCurrentUserData();
  }

  async loadPacketes() {
    this.loading = true;
    try {
      this.packetes = await this.packetesService.getAllPacketes();
      this.filterPacketes();
    } catch (error) {
      console.error('Error cargando packetes:', error);
      this.showAlert('Error', 'No se pudo cargar el registro de packetes');
    } finally {
      this.loading = false;
    }
  }

  filterPacketes() {
    let filtered = [...this.packetes];

    // Filtrar por tipo
    switch (this.filterType) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(pack => {
          const receivedDate = new Date(pack.receivedTime);
          receivedDate.setHours(0, 0, 0, 0);
          return receivedDate.getTime() === today.getTime();
        });
        break;
      case 'pending':
        filtered = filtered.filter(pack => !pack.pickedUpTime);
        break;
    }

    // Filtrar por búsqueda
    if (this.searchTerm && this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(pack => {
        const recipient = pack.recipientName?.toLowerCase() || '';
        const apartment = pack.apartment?.toLowerCase() || '';
        const tracking = pack.trackingCode?.toLowerCase() || '';

        return recipient.includes(search) ||
               apartment.includes(search) ||
               tracking.includes(search);
      });
    }

    this.filteredPacketes = filtered;
  }

  searchPacketes() {
    this.filterPacketes();
  }

  showAddModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.newPackete = {
      recipientName: '',
      trackingCode: '',
      apartment: '',
      carrier: '',
      storageLocation: '',
      notes: ''
    };
  }

  async savePackete() {
    // Validar campos obligatorios
    if (!this.newPackete.recipientName ||
        !this.newPackete.trackingCode ||
        !this.newPackete.apartment) {
      await this.showAlert(
        'Error',
        'Por favor completa los campos obligatorios: Destinatario, Código/Tracking y Apartamento'
      );
      return;
    }

    this.saving = true;

    try {
      const pack: Omit<PacketeEntry, 'id'> = {
        conserjeId: this.currentUser?.uid || '',
        conserjeName: this.currentUser?.displayName || 'Conserje',
        recipientName: this.newPackete.recipientName,
        trackingCode: this.newPackete.trackingCode,
        apartment: this.newPackete.apartment,
        carrier: this.newPackete.carrier || undefined,
        storageLocation: this.newPackete.storageLocation || undefined,
        receivedTime: new Date(),
        pickedUpTime: undefined,
        notes: this.newPackete.notes || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // limpiar undefined
      Object.keys(pack).forEach((key) => {
        if (pack[key as keyof typeof pack] === undefined) {
          delete pack[key as keyof typeof pack];
        }
      });

      await this.packetesService.createPackete(pack);

      await this.showAlert('Éxito', 'Packete registrado correctamente');
      this.closeModal();
      await this.loadPacketes();
    } catch (error) {
      console.error('Error guardando packete:', error);
      await this.showAlert('Error', 'No se pudo registrar el packete');
    } finally {
      this.saving = false;
    }
  }

  async registerPickup(pack: PacketeEntry) {
    const alert = await this.alertController.create({
      header: 'Registrar Retiro',
      message: `¿Confirmar que el packete de ${pack.recipientName} fue retirado?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              await this.packetesService.registerPickup(pack.id!);
              this.showAlert('Éxito', 'Retiro registrado correctamente', () => {
                this.loadPacketes();
              });
            } catch (error) {
              console.error('Error registrando retiro:', error);
              this.showAlert('Error', 'No se pudo registrar el retiro');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deletePackete(pack: PacketeEntry) {
    const alert = await this.alertController.create({
      header: 'Eliminar Packete',
      message: `¿Estás seguro de eliminar el packete de ${pack.recipientName}?`,
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
              await this.packetesService.deletePackete(pack.id!);
              this.showAlert('Éxito', 'Packete eliminado', () => {
                this.loadPacketes();
              });
            } catch (error) {
              console.error('Error eliminando packete:', error);
              this.showAlert('Error', 'No se pudo eliminar el packete');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getEmptyMessage(): string {
    switch (this.filterType) {
      case 'today':
        return 'No hay packetes registrados hoy';
      case 'pending':
        return 'No hay packetes pendientes de retiro';
      default:
        return 'Aún no hay packetes registrados';
    }
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
