import { Component } from '@angular/core';
import { SocketService } from '../../../services/socket/socket.service';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-party-button',
  templateUrl: './create-party-button.component.html',
  styleUrls: ['./create-party-button.component.scss'],
  imports: [IonButton],
  standalone: true,
})
export class CreatePartyButtonComponent {
  constructor(private socketService: SocketService, private router: Router) {}

  createParty() {
    // Dans votre composant CreateParty
    this.socketService.emit('create-party', {});
    this.socketService
      .listen('party-created-id')
      .subscribe((partyId: string) => {
        this.router.navigate(['/lobby'], {
          queryParams: { id: partyId, isHost: true },
        });
      });
  }
}
