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
  card,
  call,
  home,
  person,
  car,
  documentText,
  logIn,
  logOut,
  trash
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { BitacoraService } from '../../services/bitacora.service';
import { BitacoraEntry } from '../../models/bitacora.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.page.html',
  styleUrls: ['./bitacora.page.scss'],
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
export class BitacoraPage implements OnInit {
  entries: BitacoraEntry[] = [];
  filteredEntries: BitacoraEntry[] = [];
  loading: boolean = true;
  saving: boolean = false;
  isModalOpen: boolean = false;
  filterType: string = 'all';
  searchTerm: string = '';
  currentUser: User | null = null;

  newEntry: Partial<BitacoraEntry> = {
    visitorName: '',
    visitorId: '',
    visitorPhone: '',
    visitingApartment: '',
    visitingResident: '',
    vehiclePlate: '',
    notes: ''
  };

  constructor(
    private bitacoraService: BitacoraService,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    addIcons({ 
      addCircle,
      clipboardOutline,
      card,
      call,
      home,
      person,
      car,
      documentText,
      logIn,
      logOut,
      trash
    });
  }

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadEntries();
  }

  async loadCurrentUser() {
    this.currentUser = await this.authService.getCurrentUserData();
  }

  async loadEntries() {
    this.loading = true;
    try {
      this.entries = await this.bitacoraService.getAllEntries();
      this.filterEntries();
    } catch (error) {
      console.error('Error cargando bitácora:', error);
      this.showAlert('Error', 'No se pudo cargar la bitácora');
    } finally {
      this.loading = false;
    }
  }

  filterEntries() {
    let filtered = [...this.entries];

    // Filtrar por tipo
    switch (this.filterType) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.entryTime);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        });
        break;
      case 'active':
        filtered = filtered.filter(entry => !entry.exitTime);
        break;
    }

    // Filtrar por búsqueda
    if (this.searchTerm && this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        const visitorName = entry.visitorName?.toLowerCase() || '';
        const apartment = entry.visitingApartment?.toLowerCase() || '';
        const resident = entry.visitingResident?.toLowerCase() || '';
        
        return visitorName.includes(search) || 
               apartment.includes(search) || 
               resident.includes(search);
      });
    }

    this.filteredEntries = filtered;
  }

  searchEntries() {
    this.filterEntries();
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
    this.newEntry = {
      visitorName: '',
      visitorId: '',
      visitorPhone: '',
      visitingApartment: '',
      visitingResident: '',
      vehiclePlate: '',
      notes: ''
    };
  }

async saveEntry() {
  // Validar campos obligatorios
  if (!this.newEntry.visitorName || 
      !this.newEntry.visitorId || 
      !this.newEntry.visitingApartment) {
    await this.showAlert('Error', 'Por favor completa los campos obligatorios: Nombre, Documento y Apartamento');
    return;
  }

  this.saving = true;

  try {
    // Crear el objeto entry con valores seguros
    const entry: Omit<BitacoraEntry, 'id'> = {
      conserjeId: this.currentUser?.uid || '',
      conserjeeName: this.currentUser?.displayName || 'Conserje',
      visitorName: this.newEntry.visitorName,
      visitorId: this.newEntry.visitorId,
      visitorPhone: this.newEntry.visitorPhone || undefined,
      visitingApartment: this.newEntry.visitingApartment,
      visitingResident: this.newEntry.visitingResident || undefined,
      entryTime: new Date(),
      exitTime: undefined,
      vehiclePlate: this.newEntry.vehiclePlate || undefined,
      notes: this.newEntry.notes || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

   // Limpia los campos undefined (Firebase no los acepta)
Object.keys(entry).forEach((key) => {
  if (entry[key as keyof typeof entry] === undefined) {
    delete entry[key as keyof typeof entry];
  }
});

await this.bitacoraService.createEntry(entry);

    
    await this.showAlert('Éxito', 'Visitante registrado correctamente');
    this.closeModal();
    await this.loadEntries();
  } catch (error) {
    console.error('Error guardando entrada:', error);
    await this.showAlert('Error', 'No se pudo registrar el visitante');
  } finally {
    this.saving = false;
  }
}
  async registerExit(entry: BitacoraEntry) {
    const alert = await this.alertController.create({
      header: 'Registrar Salida',
      message: `¿Confirmar salida de ${entry.visitorName}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              await this.bitacoraService.registerExit(entry.id!);
              this.showAlert('Éxito', 'Salida registrada correctamente', () => {
                this.loadEntries();
              });
            } catch (error) {
              console.error('Error registrando salida:', error);
              this.showAlert('Error', 'No se pudo registrar la salida');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteEntry(entry: BitacoraEntry) {
    const alert = await this.alertController.create({
      header: 'Eliminar Registro',
      message: `¿Estás seguro de eliminar el registro de ${entry.visitorName}?`,
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
              await this.bitacoraService.deleteEntry(entry.id!);
              this.showAlert('Éxito', 'Registro eliminado', () => {
                this.loadEntries();
              });
            } catch (error) {
              console.error('Error eliminando registro:', error);
              this.showAlert('Error', 'No se pudo eliminar el registro');
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
        return 'No hay visitas registradas hoy';
      case 'active':
        return 'No hay visitantes dentro del edificio';
      default:
        return 'Aún no hay registros en la bitácora';
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