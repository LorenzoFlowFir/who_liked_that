import { Component,  Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from '../../../models/user.model';
import { UserInfoService } from '../../../services/user-info/user-info.service';
import { ModalController } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-set-profile-picture',
  templateUrl: './set-profile-picture.page.html',
  styleUrls: ['./set-profile-picture.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SetProfilePicturePage implements OnInit {
  @Input() actual_profile_picture: string= '';
  selectedImage: string = '';

  images: string[] = [];

  constructor(
    private modalController: ModalController,
  ) {}

  ngOnInit() {
    this.images = [
      '../../../assets/profil_picture/avatar_0.png',
      '../../../assets/profil_picture/avatar_1.png',
      '../../../assets/profil_picture/avatar_2.png',
      '../../../assets/profil_picture/avatar_3.png',
      '../../../assets/profil_picture/avatar_4.png',
      '../../../assets/profil_picture/avatar_5.png',
      '../../../assets/profil_picture/avatar_6.png',
      '../../../assets/profil_picture/avatar_7.png',
    ];

    this.selectedImage = this.actual_profile_picture;
  }

  validate() {
    console.log('validate');
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

  onFileSelected(event: any) {
    const fileInput = event.target;

    // Vérifiez s'il y a des fichiers sélectionnés
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile = fileInput.files[0];

      // Utilisez FileReader pour lire le fichier en tant que Data URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

}
