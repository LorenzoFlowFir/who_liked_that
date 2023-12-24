import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyPage } from './party.page';

describe('PartyPage', () => {
  let component: PartyPage;
  let fixture: ComponentFixture<PartyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PartyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
