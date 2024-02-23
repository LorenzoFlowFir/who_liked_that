import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainSettingsPage } from './main-settings.page';

describe('MainSettingsPage', () => {
  let component: MainSettingsPage;
  let fixture: ComponentFixture<MainSettingsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MainSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
