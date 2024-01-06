const express = require('express');
const http = require('http').createServer(express());
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: {
    origin: "http://localhost:8100",
    methods: ["GET", "POST"]
  }
});

let parties = {
  // partyId: { members: [...], playlists: [...] }
};


function generatePartyId(length = 5) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

io.on('connection', (socket) => {
  // Enregistrement du nom d'utilisateur avec le socket
  socket.on('register', (username, idSpotify, profilPicture) => {
    console.log(`${username} est connecté son id spotify est ${idSpotify}`);
    socket.username = username;
    socket.idSpotify = idSpotify;
    socket.profilPicture = profilPicture;
  });

  // Création d'une nouvelle partie
  socket.on('create-party', () => {
    let partyId = generatePartyId();
    while (parties[partyId]) {
      partyId = generatePartyId();
    }
    parties[partyId] = { 
      members: [{ id: socket.id, username: socket.username, idSpotify: socket.idSpotify, profilPicture:socket.profilPicture, score: 0 }],  
      targetTrack: null,
      targetPlayer: null 
    };
    socket.join(partyId);
    io.to(partyId).emit('party-created-id', partyId);
    io.to(partyId).emit('joined-party-members', parties[partyId].members);
    console.log(parties);
    console.log(partyId + ' a été créé');
    console.log('members',parties[partyId].members)
  });

  socket.on('request-party-members', (partyId) => {
    if (parties[partyId]) {
      socket.emit('joined-party-members', parties[partyId].members);
    }
  });
  

  // Rejoindre une partie existante
  socket.on('join-party', (partyId) => {
    if (parties[partyId]) {
      socket.join(partyId);
      parties[partyId].members.push({ id: socket.id, username: socket.username, idSpotify: socket.idSpotify, profilPicture:socket.profilPicture });
      if (!parties[partyId].targetTrack) {
        parties[partyId].targetTrack = null;
        parties[partyId].targetPlayer = null;
      }
      io.to(partyId).emit('joined-party-id', partyId);
      io.to(partyId).emit('joined-party-members', parties[partyId].members);

      console.log(parties[partyId].members);
    } else {
      socket.emit('error', 'La partie n\'existe pas');
    }
  });

  socket.on('set-player-ready', ({ partyId, playlist }) => {
    const party = parties[partyId];
    if (party) {
      // Ajouter la playlist du joueur à la grande playlist de la partie
      if (!party.playlists) {
        party.playlists = [];
      }
      party.playlists.push({
        userId: socket.idSpotify,
        tracks: playlist.liked_song,
      });
      
      console.log(party.playlists);
      // Vérifier si le joueur est déjà marqué comme prêt
      const member = party.members.find(member => member.id === socket.id);
      if (member && !member.isReady) {
        member.isReady = true;
        console.log(`${member.username} est prêt et sa playlist a été ajoutée.`);
  
        // Vérifier si tous les membres sont prêts
        const allReady = party.members.every(member => member.isReady);
        io.to(partyId).emit('updated-party-members', party.members);
  
        // Si tout le monde est prêt, notifier l'hôte
        if (allReady) {
          const hostId = party.members[0].id; // Supposons que le premier membre est l'hôte
          io.to(hostId).emit('all-players-ready', party.playlists);
          console.log('Tous les joueurs sont prêts');
        }
      }
    }
  });
  
  
  socket.on('launch-party', (partyId) => {
    const party = parties[partyId];
    if (party && party.members.every(member => member.isReady)) {
      console.log('La partie est lancée, envoi des infos :', {
        members: party.members,
        playlists: party.playlists
      });
      socket.on('request-party-info', (partyId) => {
        if (parties[partyId]) {
          io.to(partyId).emit('party-info', {
            members: party.members,
            playlists: party.playlists
          });        
        }
      });  
      
      io.to(partyId).emit('party-launched');
    }
  });
  
  socket.on('target-track', ({ partyId, track, player }) => {
    const party = parties[partyId];
    if (party) {
      console.log('Le son joué est:', track.name, 'de', track.artist);
      console.log('Le joueur qui écoute cette musique est:', player.username);

      // Stocker les informations de la piste ciblée dans l'objet de la partie
      party.targetTrack = track;
      party.targetPlayer = player;

      io.to(partyId).emit('send-target-track', {
        track: party.targetTrack,
        player: party.targetPlayer,
        members: party.members,
      });
    }
  });

  socket.on('start-voting', (partyId) => {
    io.to(partyId).emit('voting-started');
  });

  socket.on('toggle-hidden', ({ partyId, hidden }) => {
    const party = parties[partyId];
    if (party) {
      io.to(partyId).emit('update-hidden', { hidden });
    }
  });
  

  socket.on('leave-party', (partyId) => {
    const party = parties[partyId];
    if (party) {
      const memberIndex = party.members.findIndex(member => member.id === socket.id);
      if (memberIndex !== -1) {
        party.members.splice(memberIndex, 1);
        if (party.members.length === 0 || party.members[0].id === socket.id) {
          delete parties[partyId];
          io.to(partyId).emit('party-ended');
        } else {
          io.to(partyId).emit('updated-party-members', party.members);
        }
      }
    }
  });

  socket.on('player-guess', ({ partyId, playerId, isCorrect }) => {
    const party = parties[partyId];
    if (party) {
      const guessingPlayer = party.members.find(member => member.idSpotify === playerId);
      const targetPlayer = party.members.find(member => member.id === party.targetPlayer.id);
  
      if (guessingPlayer) {
        if (isCorrect) {
          guessingPlayer.score = (guessingPlayer.score || 0) + 10;
          console.log(`Le score du joueur ${playerId} est maintenant de ${guessingPlayer.score}`);
        } else if (targetPlayer) {
          // Augmenter le score du Target Player si le vote est incorrect
          targetPlayer.score = (targetPlayer.score || 0) + 5;
          console.log(`Le score du Target Player ${targetPlayer.idSpotify} est maintenant de ${targetPlayer.score}`);
        }
      }
  
      io.to(partyId).emit('scores-updated', party.members.map(member => ({ id: member.idSpotify, score: member.score })));
    }
  });

  
  socket.on('end-game', (partyId) => {
    const party = parties[partyId];
    if (party) {
      // Tri des membres par score décroissant
      const sortedMembers = party.members.sort((a, b) => b.score - a.score);
      io.to(partyId).emit('game-ended', sortedMembers);
    }
  });
  


  // Gérer la déconnexion d'un utilisateur
  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
    for (let partyId in parties) {
      const party = parties[partyId];
      const memberIndex = party.members.findIndex(member => member.id === socket.id);
      if (memberIndex !== -1) {
        party.members.splice(memberIndex, 1);
        // Envoyer la liste mise à jour des membres restants
        io.to(partyId).emit('updated-party-members', party.members);
        if (party.members.length === 0) {
          delete parties[partyId];
        }
        break;
      }
    }
  });
  
});


http.listen(4444, () => {
  console.log('Écoute sur le port 4444');
});
