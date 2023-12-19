import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket/socket.service';
import { IonButton, IonInput } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms'; // Import the FormsModule
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-party-button',
  templateUrl: './join-party-button.component.html',
  styleUrls: ['./join-party-button.component.scss'],
  standalone: true,
  imports: [IonInput, IonButton, FormsModule], // Add FormsModule to the imports
})
export class JoinPartyButtonComponent implements OnInit {
  partyId: string | undefined;

  constructor(private socketService: SocketService, private router: Router) {}
  ngOnInit(): void {
    console.log('JoinPartyButtonComponent');
  }

  joinParty() {
    if (this.partyId) {
      this.socketService.emit('join-party', this.partyId);
      this.socketService.listen('joined-party-id').subscribe((data) => {
        this.router.navigate(['/lobby'], {
          queryParams: { id: this.partyId },
        });
        console.log('Joined Party:', data);
        // Gérez la suite des événements après avoir rejoint la partie
      });
    } else {
      console.error('Veuillez entrer un ID de partie valide');
    }
  }
}
