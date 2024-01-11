import { Component, Input, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { Track } from 'src/app/models/track.model';

@Component({
  selector: 'app-song-detail',
  templateUrl: './song-detail.component.html',
  styleUrls: ['./song-detail.component.scss'],
  standalone: true,
  imports: [IonContent],
})
export class SongDetailComponent {
  @Input() track: Track | undefined;

  constructor() {}
}
