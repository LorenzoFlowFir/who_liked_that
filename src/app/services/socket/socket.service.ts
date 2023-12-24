import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: any;
  readonly uri: string = 'http://51.38.113.168:4444/';

  constructor() {
    this.socket = io(this.uri);
  }

  registerUser(username: string, idSpotify: string, profilPicture: string) {
    this.socket.emit('register', username, idSpotify, profilPicture);
  }

  // Écouter des événements spécifiques émis par le serveur
  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }

  // Émettre des événements vers le serveur
  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
