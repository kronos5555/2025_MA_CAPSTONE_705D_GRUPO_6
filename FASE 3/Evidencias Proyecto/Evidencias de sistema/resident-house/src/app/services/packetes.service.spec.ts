import { TestBed } from '@angular/core/testing';
import { PacketesService } from './packetes.service';
import { Firestore } from '@angular/fire/firestore';

describe('PacketesService', () => {
  let service: PacketesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PacketesService,
        // Mock simple de Firestore para que no reviente el test
        { provide: Firestore, useValue: {} }
      ]
    });

    service = TestBed.inject(PacketesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
