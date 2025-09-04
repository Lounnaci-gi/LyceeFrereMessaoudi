# Lycée des Frères Messaoudi - Système de Gestion

Système complet de gestion scolaire pour le Lycée des Frères Messaoudi, développé avec Node.js/Express (backend) et React (frontend), utilisant MongoDB Atlas comme base de données.

## 🚀 Fonctionnalités

### Gestion des Utilisateurs
- **Authentification JWT** avec rôles et permissions
- **Gestion des rôles** : Admin, Enseignant, Parent, Élève
- **Système de permissions** granulaire
- **Changement de mot de passe** sécurisé

### Gestion des Élèves
- **Inscription et gestion** des élèves
- **Photos de profil** avec upload sécurisé
- **Informations personnelles** complètes
- **Liaison avec les parents**
- **Historique académique**

### Gestion des Classes et Spécialités
- **Classes** par niveau et année académique
- **Spécialités** (Sciences Expérimentales, Mathématiques, etc.)
- **Capacité des classes** et gestion des effectifs

### Suivi des Absences
- **Enregistrement des absences** par date
- **Justification des absences**
- **Statistiques** et rapports
- **Notifications** aux parents

### Gestion des Incidents
- **Signalement d'incidents** disciplinaires
- **Niveaux de gravité** (faible, moyen, élevé, critique)
- **Suivi des actions** prises
- **Historique complet**

### Conseils de Discipline
- **Création de conseils** de discipline
- **Gestion des cas** disciplinaires
- **Décisions** et sanctions
- **Suivi des procédures**

### Tableau de Bord
- **Statistiques** en temps réel
- **Graphiques** et visualisations
- **Activités récentes**
- **Indicateurs** de performance

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec Express.js
- **MongoDB Atlas** (base de données cloud)
- **Mongoose** (ODM pour MongoDB)
- **JWT** pour l'authentification
- **Multer** pour les uploads de fichiers
- **bcryptjs** pour le hashage des mots de passe
- **Express Validator** pour la validation
- **Helmet** pour la sécurité
- **Morgan** pour le logging
- **Compression** pour l'optimisation

### Frontend
- **React 18** avec hooks
- **React Router** pour la navigation
- **React Query** pour la gestion d'état
- **React Hook Form** pour les formulaires
- **TailwindCSS** pour le styling
- **Recharts** pour les graphiques
- **Lucide React** pour les icônes
- **Framer Motion** pour les animations
- **Axios** pour les appels API

### Support Multilingue
- **Interface en arabe** avec support RTL
- **Police Cairo** pour l'arabe
- **Layout adaptatif** RTL/LTR

## 📦 Installation et Configuration

### Prérequis
- Node.js 16+ 
- npm ou yarn
- Compte MongoDB Atlas

### 1. Configuration de l'Environnement

Créez un fichier `.env` dans le dossier `backend/` avec vos paramètres :

```env
# Configuration de l'environnement
NODE_ENV=development
PORT=5000

# Configuration MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Configuration des uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Configuration CORS
CORS_ORIGIN=http://localhost:3000

# Configuration Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuration Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Configuration Admin
ADMIN_EMAIL=admin@example.com
ADMIN_SECRET=your-admin-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrateur
```

### 2. Installation du Backend

```bash
cd backend
npm install
```

### 3. Installation du Frontend

```bash
cd frontend
npm install
```

## 🚀 Démarrage

### Backend
```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### Frontend
```bash
cd frontend
npm start
```

L'application démarre sur `http://localhost:3000`

## 📊 Structure de la Base de Données

### Collections MongoDB
- **users** - Utilisateurs du système
- **roles** - Rôles et permissions
- **students** - Élèves
- **parents** - Parents des élèves
- **classes** - Classes et niveaux
- **specialties** - Spécialités académiques
- **teachers** - Enseignants
- **subjects** - Matières enseignées
- **absences** - Absences des élèves
- **incidents** - Incidents disciplinaires
- **discipline_councils** - Conseils de discipline
- **disciplinary_cases** - Cas disciplinaires

## 🔐 Authentification et Autorisation

### Rôles Disponibles
1. **Admin** - Accès complet au système
2. **Teacher** - Gestion des élèves, absences, incidents
3. **Parent** - Consultation des informations de ses enfants
4. **Student** - Accès limité aux informations personnelles

### Permissions
- **students:read** - Lecture des informations élèves
- **students:create** - Création d'élèves
- **students:update** - Modification d'élèves
- **students:delete** - Suppression d'élèves
- **absences:read** - Consultation des absences
- **absences:create** - Enregistrement d'absences
- **incidents:read** - Consultation des incidents
- **incidents:create** - Signalement d'incidents

## 📁 Structure du Projet

```
lycee-freres-messaoudi/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuration MongoDB
│   ├── middleware/
│   │   ├── auth.js              # Middleware d'authentification
│   │   └── upload.js            # Middleware d'upload
│   ├── models/
│   │   └── index.js             # Modèles Mongoose
│   ├── routes/
│   │   ├── auth.js              # Routes d'authentification
│   │   └── students.js          # Routes des élèves
│   ├── uploads/                 # Fichiers uploadés
│   ├── package.json
│   ├── server.js                # Serveur principal
│   └── config.env.example       # Template des variables d'environnement
├── frontend/
│   ├── public/
│   │   └── index.html           # Page HTML principale
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js        # Layout principal
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Contexte d'authentification
│   │   ├── pages/
│   │   │   ├── Login.js         # Page de connexion
│   │   │   ├── Dashboard.js     # Tableau de bord
│   │   │   ├── Students.js      # Gestion des élèves
│   │   │   ├── Teachers.js      # Gestion des enseignants
│   │   │   ├── Absences.js      # Gestion des absences
│   │   │   ├── Incidents.js     # Gestion des incidents
│   │   │   ├── Discipline.js    # Conseils de discipline
│   │   │   └── Settings.js      # Paramètres
│   │   ├── services/
│   │   │   └── authService.js   # Service d'authentification
│   │   ├── App.js               # Composant principal
│   │   ├── index.js             # Point d'entrée
│   │   └── index.css            # Styles globaux
│   ├── package.json
│   └── tailwind.config.js       # Configuration Tailwind
└── README.md
```

## 🔧 Commandes Utiles

### Backend
```bash
# Démarrage en développement
npm run dev

# Démarrage en production
npm start

# Tests
npm test

# Tests en mode watch
npm run test:watch
```

### Frontend
```bash
# Démarrage en développement
npm start

# Build pour production
npm run build

# Tests
npm test
```

## 🌐 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/verify` - Vérification du token
- `PUT /api/auth/change-password` - Changement de mot de passe

### Élèves
- `GET /api/students` - Liste des élèves (avec pagination)
- `GET /api/students/:id` - Détails d'un élève
- `POST /api/students` - Créer un élève
- `PUT /api/students/:id` - Modifier un élève
- `DELETE /api/students/:id` - Supprimer un élève

### Santé du Système
- `GET /health` - Vérification de l'état du serveur

## 🔒 Sécurité

- **JWT** pour l'authentification
- **bcryptjs** pour le hashage des mots de passe
- **Helmet** pour les en-têtes de sécurité
- **Rate limiting** pour prévenir les attaques
- **Validation** des données d'entrée
- **CORS** configuré
- **Uploads sécurisés** avec validation des types de fichiers

## 📈 Monitoring et Logs

- **Morgan** pour les logs HTTP
- **Console logs** détaillés
- **Gestion d'erreurs** centralisée
- **Health checks** automatiques

## 🚀 Déploiement

### Variables d'Environnement de Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-user:prod-password@cluster.mongodb.net/prod-database
JWT_SECRET=very-long-and-secure-jwt-secret
CORS_ORIGIN=https://your-domain.com
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Déploiement Backend
```bash
cd backend
npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Email : admin@lycee-freres-messaoudi.com
- Téléphone : +213 XX XX XX XX

---

**Lycée des Frères Messaoudi** - Système de Gestion Scolaire Moderne 