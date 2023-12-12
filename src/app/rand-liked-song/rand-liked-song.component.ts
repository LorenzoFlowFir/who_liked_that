import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LikedSongService } from '../services/liked-song/liked-song.service';
import { Track } from '../models/track.model';
import { IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-rand-liked-song',
  templateUrl: './rand-liked-song.component.html',
  styleUrls: ['./rand-liked-song.component.scss'],
  imports: [IonSpinner, CommonModule],
  standalone: true,
})
export class RandLikedSongComponent implements OnInit {
  public playlist: Track[] = [];
  public allTracks: Track[] = [];
  public loader = this.randomLikeService.loader;
  public isDisconnected = true;
  @Input() public accessToken: any;

  // dans rand-liked-song.component.ts
  constructor(private randomLikeService: LikedSongService) {}

  ngOnInit() {
    this.randomLikeService
      .getLikedTracksAndPlayRandomTrack(this.accessToken)
      .then(() => {
        this.randomLikeService.displayLikedTrack();
      });
    console.log(this.randomLikeService.loader);
  }
}
