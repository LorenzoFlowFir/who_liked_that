import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassementPage } from './classement.page';

describe('ClassementPage', () => {
  let component: ClassementPage;
  let fixture: ComponentFixture<ClassementPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ClassementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
