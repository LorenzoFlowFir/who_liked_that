import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RandomSongForTheGameComponent } from './random-song-for-the-game.component';

describe('RandomSongForTheGameComponent', () => {
  let component: RandomSongForTheGameComponent;
  let fixture: ComponentFixture<RandomSongForTheGameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RandomSongForTheGameComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RandomSongForTheGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
