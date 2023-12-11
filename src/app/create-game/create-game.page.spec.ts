import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateGamePage } from './create-game.page';

describe('CreateGamePage', () => {
  let component: CreateGamePage;
  let fixture: ComponentFixture<CreateGamePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CreateGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
