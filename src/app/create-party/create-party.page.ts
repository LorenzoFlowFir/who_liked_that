import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-create-party',
  templateUrl: './create-party.page.html',
  styleUrls: ['./create-party.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CreatePartyPage implements OnInit {
  constructor(private socketService: SocketService) {}

  public partyId: string | undefined;

  ngOnInit(): void {
    this.createParty();
  }

  createParty() {
    this.socketService.emit('create-party', {});
    this.socketService.listen('party-created').subscribe((partyId: string) => {
      console.log('Party Created with ID:', partyId);
      this.partyId = partyId;
      // Vous pouvez ici rediriger l'utilisateur vers la salle d'attente ou la page de la partie
    });
  }
}
