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
  IonImg,
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
    IonImg,
  ],
})
export class ClassementPage implements OnInit {
  public members: any[] = [];

  // * Pour tester la page sans devoir faire toute une partie
  // public members: any[] = [
  //   {
  //     id: '0',
  //     username: 'Lorenzo Sgr',
  //     idSpotify: 'lorenzofir2903',
  //     profilPicture:
  //       'https://i.scdn.co/image/ab6775700000ee856aee2547f831f6bacabaec97',
  //     score: 75,
  //   },
  //   {
  //     id: '1',
  //     username: 'Lorenzofir',
  //     idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
  //     profilPicture:
  //       'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
  //     score: 50,
  //   },
  //   {
  //     id: '2',
  //     username: 'Lorenzofir',
  //     idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
  //     profilPicture:
  //       'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
  //     score: 25,
  //   },
  //   {
  //     id: '3',
  //     username: 'Lorenzofir',
  //     idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
  //     profilPicture:
  //       'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
  //     score: 25,
  //   },
  //   {
  //     id: '4',
  //     username: 'Lorenzofir',
  //     idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
  //     profilPicture:
  //       'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
  //     score: 25,
  //   },
  //   {
  //     id: '5',
  //     username: 'Lorenzofir',
  //     idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
  //     profilPicture:
  //       'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
  //     score: 25,
  //   },
  //   {
  //     id: '6',
  //     username: 'Lorenzofir',
  //     idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
  //     profilPicture:
  //       'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
  //     score: 25,
  //   },
  //   {
  //     id: '7',
  //     username: 'Lorenzofir',
  //     idSpotify: '31sytxmxupm25u22g26zfxvckjmm',
  //     profilPicture:
  //       'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=658d7416&is=657aff16&hm=3ca6d9918fe7e1044a8242fa6af03ac6e5701cad633a00507489a486ca317b30&=&format=webp&quality=lossless&width=624&height=624',
  //     score: 25,
  //   },
  // ];

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

    let W: number = window.innerWidth;
    let H: number = document.getElementById('confetti')!.clientHeight;
    const canvas: HTMLCanvasElement = document.getElementById(
      'confetti'
    )! as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
    const maxConfettis: number = 25;
    const particles: confettiParticle[] = [];

    const possibleColors: string[] = [
      '#ff7336',
      '#f9e038',
      '#02cca4',
      '#383082',
      '#fed3f5',
      '#b1245a',
      '#f2733f',
    ];

    function randomFromTo(from: number, to: number): number {
      return Math.floor(Math.random() * (to - from + 1) + from);
    }

    class confettiParticle {
      x: number;
      y: number;
      r: number;
      d: number;
      color: string;
      tilt: number;
      tiltAngleIncremental: number;
      tiltAngle: number;

      constructor() {
        this.x = Math.random() * W; // x
        this.y = Math.random() * H - H; // y
        this.r = randomFromTo(11, 33); // radius
        this.d = Math.random() * maxConfettis + 11;
        this.color =
          possibleColors[Math.floor(Math.random() * possibleColors.length)];
        this.tilt = Math.floor(Math.random() * 33) - 11;
        this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
        this.tiltAngle = 0;
      }

      draw(): void {
        context.beginPath();
        context.lineWidth = this.r / 2;
        context.strokeStyle = this.color;
        context.moveTo(this.x + this.tilt + this.r / 3, this.y);
        context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
        context.stroke();
      }
    }

    function Draw(): void {
      const results: void[] = [];

      // Magical recursive functional love
      requestAnimationFrame(Draw);

      context.clearRect(0, 0, W, window.innerHeight);

      for (let i = 0; i < maxConfettis; i++) {
        results.push(particles[i].draw());
      }

      let particle: confettiParticle;
      let remainingFlakes: number = 0;
      for (let i = 0; i < maxConfettis; i++) {
        particle = particles[i];

        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
        particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;

        if (particle.y <= H) remainingFlakes++;

        // If a confetti has fluttered out of view,
        // bring it back to above the viewport and let it re-fall.
        if (particle.x > W + 30 || particle.x < -30 || particle.y > H) {
          particle.x = Math.random() * W;
          particle.y = -30;
          particle.tilt = Math.floor(Math.random() * 10) - 20;
        }
      }
    }

    window.addEventListener(
      'resize',
      function () {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      },
      false
    );

    // Push new confetti objects to `particles[]`
    for (let i = 0; i < maxConfettis; i++) {
      particles.push(new confettiParticle());
    }

    // Initialize
    canvas.width = W;
    canvas.height = H;
    Draw();
  }

  public backHome() {
    if (this.partyId) {
      this.socketService.emit('leave-party', this.partyId);
      this.router.navigate(['/home']); // Naviguez vers la page d'accueil
    }
  }
}
