import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetProfilePicturePage } from './set-profile-picture.page';

describe('SetProfilePicturePage', () => {
  let component: SetProfilePicturePage;
  let fixture: ComponentFixture<SetProfilePicturePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SetProfilePicturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
