# Utiliser une image Node.js comme base
FROM node:latest

# Définir le répertoire de travail dans le conteneur
WORKDIR /src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install
RUN npm install -g @ionic/cli

# Copier les fichiers et dossiers du projet dans le répertoire de travail du conteneur
COPY . .

# Construire l'application Ionic
RUN ionic build

# Exposer le port 9999
EXPOSE 9999

# Commande pour démarrer l'application
ENTRYPOINT ["ionic"]
CMD ["serve", "--no-open", "--host", "0.0.0.0", "--port", "9999"]