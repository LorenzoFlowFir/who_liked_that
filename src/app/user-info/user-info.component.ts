import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { LikedSongService } from '../services/liked-song/liked-song.service';
import { UserInfoService } from '../services/user-info/user-info.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  standalone: true,
})
export class UserInfoComponent implements OnInit {
  @Input() public accessToken: any;
  @Output() userChanged = new EventEmitter<User>();

  public user: User | undefined;

  constructor(
    public randomlikeService: LikedSongService,
    public userInfoService: UserInfoService
  ) {}

  ngOnInit() {
    this.userInfoService
      .getInfoPersonnelUtilisateur(this.accessToken)
      .then(async (userProfile) => {
        const user = await this.userInfoService.CreateUser(userProfile);
        if (user instanceof Error) {
          console.error('Une erreur est survenue :', user);
        } else {
          this.user = user;
          this.userChanged.emit(this.user);
          this.userInfoService.setCurrentUser(this.user);
          const utilisateurExiste =
            await this.userInfoService.VerifierUtilisateurExiste(user.id);
          if (utilisateurExiste) {
            this.userInfoService.GetUserInfoFromDB(user.id);
          } else {
            this.userInfoService.AddUserInDB(user);
          }
        }
      });
  }
}
