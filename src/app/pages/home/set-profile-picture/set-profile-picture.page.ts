import { Component,  Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from '../../../models/user.model';
import { UserInfoService } from '../../../services/user-info/user-info.service';
import { ModalController } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { environment } from '../../../../environments/environment';
import { navigate } from 'ionicons/icons';

@Component({
  selector: 'app-set-profile-picture',
  templateUrl: './set-profile-picture.page.html',
  styleUrls: ['./set-profile-picture.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SetProfilePicturePage implements OnInit {
  @Input() actual_profile_picture: string= '';
  public accessToken = environment.accessToken;
  public photoProfilSpotify: string = '';
  
  selectedImage: string = '';
  // Propriété pour stocker le nouveau lien de l'image
  nouveauLienImage: string = '';
  myUser : User | undefined;

  images: string[] = [];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private userInfoService: UserInfoService,
  ) {}

  ngOnInit() {
    this.images = [
      'https://media.discordapp.net/attachments/1157341620002365502/1182308492737007648/avatar_rihanna.png?ex=65e08296&is=65ce0d96&hm=3062f6dad8709e0aa36cf5800ffa3d87d8db6d204f5fc26f3830f44b54d332e3&=&format=webp&quality=lossless&width=700&height=700',
      'https://media.discordapp.net/attachments/1157341620002365502/1195062379038388285/avatar_bob_marley.png?ex=65e0c412&is=65ce4f12&hm=22ecc566f14be3f33105e5e02ed0556e41ce0c6366d72cb76cb63c1e7a30e4e1&=&format=webp&quality=lossless&width=700&height=700',
      'https://media.discordapp.net/attachments/1157341620002365502/1195062395274539050/avatar_damso.png?ex=65e0c416&is=65ce4f16&hm=6afad7f6338457fa71037b9c360c97531ff0b19964975c0e80ad48dcea746f7f&=&format=webp&quality=lossless&width=700&height=700',
      'https://media.discordapp.net/attachments/1157341620002365502/1195062407240884275/avatar_eminem.png?ex=65e0c419&is=65ce4f19&hm=1d192d457ce0d551816736d5fec7979d86338255f0c6ceb1f4d84bcfc859e195&=&format=webp&quality=lossless&width=700&height=700',
      'https://media.discordapp.net/attachments/1157341620002365502/1195062419060437032/avatar_lady_gaga.png?ex=65e0c41b&is=65ce4f1b&hm=3745c23c598bde259ce30510e1b1308ae7e32946d4e68b4e03b44ba320425468&=&format=webp&quality=lossless&width=700&height=700',
      'https://media.discordapp.net/attachments/1157341620002365502/1195062430343114865/avatar_nekfeu.png?ex=65e0c41e&is=65ce4f1e&hm=607178e5649b1bf4890c5a99eda537bcd8fce089ed5646ddcb947b4948c849ff&=&format=webp&quality=lossless&width=700&height=700',
      'https://media.discordapp.net/attachments/1157341620002365502/1195062453470494853/avatar_stromae.png?ex=65e0c424&is=65ce4f24&hm=56e3ce7f2f04a7b54b6560bfc082a6d4de7c427393d5145f5a952e7b24e14ad6&=&format=webp&quality=lossless&width=700&height=700',
      'https://media.discordapp.net/attachments/1157341620002365502/1195062461573890179/avatar_travis_scott.png?ex=65e0c426&is=65ce4f26&hm=6082d21f9fad9af89db872b743d98dd08c45db7c6c7987c54b626161bb56c727&=&format=webp&quality=lossless&width=1044&height=1044',
    ];

    this.getMyUser();
    this.getProfilePictureFromSpotify().then((url) => {
      this.photoProfilSpotify = url;
      console.log(this.photoProfilSpotify)
    }
    );

      
      
    
    this.selectedImage = this.actual_profile_picture;
  }

  public async getProfilePictureFromSpotify(): Promise<string>{
    return await this.userInfoService
      .getInfoPersonnelUtilisateur(this.accessToken).then((user:any) => {
        console.log(user.images[1]?.url);
          
        return user.images[1]?.url;
        
      });
  }

  getMyUser() {
    this.userInfoService
      .GetUserInfoFromDB(this.userInfoService.user!.id)
      .then((user) => {
        if (user) {
          this.myUser = user;
        }
      })
    }

  async validate() {
    if (this.myUser) {
      await this.userInfoService.updateUserProfilePicture( this.myUser?.id ,this.selectedImage);
      this.modalController.dismiss(this.selectedImage);
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }


  selectImage(image: string) {
    this.selectedImage = image;
  }

  isImageSelected(image: string): boolean {
    return this.selectedImage === image;
  }

  // Cette fonction est appelée lorsqu'un fichier est sélectionné
  async onFileSelected(event: any) {
    const fileInput = event.target;

    // Vérifiez s'il y a des fichiers sélectionnés
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile = fileInput.files[0];

      // Utilisez FileReader pour lire le fichier en tant que Data URL
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        // Récupérez l'image d'origine en tant qu'élément d'image
        const originalImage = new Image();
        originalImage.onload = () => {
          // Créez un canvas pour découper l'image en carré
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (context) {
            const maxSize = Math.min(originalImage.width, originalImage.height);
            canvas.width = maxSize;
            canvas.height = maxSize;

            // Calculer les positions de découpe
            const offsetX = (originalImage.width - maxSize) / 2;
            const offsetY = (originalImage.height - maxSize) / 2;

            // Dessinez l'image dans le canvas avec découpe
            context.drawImage(originalImage, offsetX, offsetY, maxSize, maxSize, 0, 0, maxSize, maxSize);

            // Obtenez le data URL du canvas découpé
            this.selectedImage = canvas.toDataURL('image/png');
          } else {
            console.error('Le contexte du canvas est null.');
          }
        };
        originalImage.src = e.target.result;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  // Fonction pour mettre à jour la photo de profil avec le lien d'image saisi
  mettreAJourPhoto() {
    if (this.nouveauLienImage.trim() !== '') {
      // Créez un nouvel objet Image
      const img = new Image();
  
      // Définissez une fonction de rappel qui sera appelée une fois l'image chargée
      img.onload = () => {
        // Vérifiez si les dimensions de l'image sont égales (carrées)
        if (img.width === img.height) {
          // Mettez à jour l'attribut selectedImage avec le lien d'image
          this.selectedImage = this.nouveauLienImage;
  
          // Effacez la valeur de l'input
          this.nouveauLienImage = '';
        } else {
          // Gérez l'erreur si l'image n'est pas carrée
          console.error('L\'image n\'est pas carrée. Veuillez sélectionner une image carrée.');
          this.nouveauLienImage = '';
        }
      };
  
      // Définissez la source de l'image sur le lien fourni
      img.src = this.nouveauLienImage;
    }
  }


}
