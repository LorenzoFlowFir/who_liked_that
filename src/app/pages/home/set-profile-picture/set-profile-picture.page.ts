import { Component,  Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from '../../../models/user.model';
import { UserInfoService } from '../../../services/user-info/user-info.service';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-set-profile-picture',
  templateUrl: './set-profile-picture.page.html',
  styleUrls: ['./set-profile-picture.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SetProfilePicturePage implements OnInit {
  @Input() public accessToken: any;
  @Output() userChanged = new EventEmitter<User>();

  public user: User | undefined;

  constructor(
    public userInfoService: UserInfoService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {}

  /*ngOnInit() {
    this.userInfoService
      .getInfoPersonnelUtilisateur(this.accessToken)
      .then(async (userProfile) => {
        const user = await this.userInfoService.CreateUser(userProfile);
        if (user instanceof Error) {
          console.error('Une erreur est survenue :', user);
        } else {
          const utilisateurExiste =
            await this.userInfoService.VerifierUtilisateurExiste(user.id);
          if (utilisateurExiste) {
            // Attendre la résolution de la promesse
            this.userInfoService.GetUserInfoFromDB(user.id).then((userInfo) => {
              if (userInfo) {
                this.user = userInfo;
                this.userChanged.emit(this.user);
                this.userInfoService.setCurrentUser(this.user);
              } else {
                // Traiter le cas où l'utilisateur n'est pas trouvé
                console.error('Utilisateur non trouvé dans la base de données');
              }
            });
          } else {
            this.userInfoService.AddUserInDB(user);
            this.user = user;
            this.userChanged.emit(this.user);
            this.userInfoService.setCurrentUser(this.user);
          }
        }
      });
  }*/

  validate() {
    console.log('validate');
  }

  dismiss() {
    this.modalController.dismiss();
  }


}
