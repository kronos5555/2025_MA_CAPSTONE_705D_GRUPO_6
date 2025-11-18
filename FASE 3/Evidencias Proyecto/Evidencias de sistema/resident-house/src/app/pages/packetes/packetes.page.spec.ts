import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacketesPage } from './packetes.page';

describe('PacketesPage', () => {
  let component: PacketesPage;
  let fixture: ComponentFixture<PacketesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
