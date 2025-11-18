import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConserjeHomePage } from './conserje-home.page';

describe('ConserjeHomePage', () => {
  let component: ConserjeHomePage;
  let fixture: ComponentFixture<ConserjeHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConserjeHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
