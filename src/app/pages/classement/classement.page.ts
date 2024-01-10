import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonBadge,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonButton,
  IonImg
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';

import { SocketService } from '../../services/socket/socket.service'; // Assurez-vous d'importer le service Socket
import { UserInfoService } from 'src/app/services/user-info/user-info.service';

@Component({
  selector: 'app-classement',
  templateUrl: './classement.page.html',
  styleUrls: ['./classement.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonBadge,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonButton,
    IonImg
  ],
})
export class ClassementPage implements OnInit {
  // public members: any[] = [];

  //* Pour tester la page sans devoir faire toute une partie
  public members: any[] = [
    {
      id: '0',
      username: 'Lorenzo Sgr',
      idSpotify: 'lorenzofir2903',
      profilPicture:
        'https://i.scdn.co/image/ab6775700000ee85c016a2b1a9b40cce84b405ea',
      score: 75,
    },
    {
      id: '1',
      username: 'Lorenzofir',
      idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
      profilPicture:
        'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
      score: 50,
    },
    {
      id: '2',
      username: 'Lorenzofir',
      idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
      profilPicture:
        'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
      score: 25,
    },
    {
      id: '3',
      username: 'Lorenzofir',
      idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
      profilPicture:
        'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
      score: 25,
    },
    {
      id: '4',
      username: 'Lorenzofir',
      idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
      profilPicture:
        'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
      score: 25,
    },
    {
      id: '5',
      username: 'Lorenzofir',
      idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
      profilPicture:
        'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
      score: 25,
    },
  ];

  public partyId: string | null = null;
  public isHost: boolean = false;

  constructor(
    private socketService: SocketService,
    private router: Router,
    private route: ActivatedRoute,
    private userInfoService: UserInfoService // Injectez UserInfoService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.partyId = params['id'];
      this.isHost = params['isHost'];
      this.socketService.emit('end-game', this.partyId);
    });

    this.socketService.listen('game-ended').subscribe((data: any) => {
      this.members = data;

      this.members.forEach((member) => {
        console.log(member.idSpotify);

        this.userInfoService.incrementUserGames(member.idSpotify);
      });

      this.userInfoService.incrementUserVictory(this.members[0].idSpotify);
    });
  }

  public backHome() {
    if (this.partyId) {
      this.socketService.emit('leave-party', this.partyId);
      this.router.navigate(['/home']); // Naviguez vers la page d'accueil
    }
  }
}
