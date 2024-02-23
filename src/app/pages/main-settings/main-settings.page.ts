import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChangePlaylistComponent } from './change-playlist/change-playlist.component';

@Component({
  selector: 'app-main-settings',
  templateUrl: './main-settings.page.html',
  styleUrls: ['./main-settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ChangePlaylistComponent],
})
export class MainSettingsPage implements OnInit {
  constructor() {}

  ngOnInit() {
    console.log('MainSettingsPage');
  }
}
