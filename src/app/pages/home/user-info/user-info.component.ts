import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { LikedSongService } from '../../../services/liked-song/liked-song.service';
import { UserInfoService } from '../../../services/user-info/user-info.service';
import { User } from '../../../models/user.model';
import { IonCard, 
  IonImg, 
  IonCardContent,
  ModalController, 
} from '@ionic/angular/standalone';
import { SetProfilePicturePage } from '../set-profile-picture/set-profile-picture.page';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  standalone: true,
  imports: [
    IonCard, 
    IonImg, 
    IonCardContent,
  ],
})
export class UserInfoComponent implements OnInit {
  @Input() public accessToken: any;
  @Output() userChanged = new EventEmitter<User>();

  public user: User | undefined;

  constructor(
    public randomlikeService: LikedSongService,
    public userInfoService: UserInfoService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {
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
  }

  //Ouverture du modal de modifications de la photo de profil
  public async showPictureSetModal() {
    const modal = await this.modalController.create({
      component: SetProfilePicturePage,
      componentProps: {
        actual_profile_picture: this.user?.photo_profil,
      },
    });

    await modal.present();

    // Attendre la fermeture du modal pour effectuer une action après sa fermeture (si nécessaire)
    const { data } = await modal.onDidDismiss();
    if (data && this.user && this.user.photo_profil !== data) {
      // Mettez à jour la propriété user?.photo_profil avec la nouvelle photo
      this.user.photo_profil = data;
    }
  }
}
