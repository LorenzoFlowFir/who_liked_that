import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatePartyPage } from './create-party.page';

describe('CreatePartyPage', () => {
  let component: CreatePartyPage;
  let fixture: ComponentFixture<CreatePartyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CreatePartyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
