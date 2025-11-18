import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResidentHomePage } from './resident-home.page';

describe('ResidentHomePage', () => {
  let component: ResidentHomePage;
  let fixture: ComponentFixture<ResidentHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResidentHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
