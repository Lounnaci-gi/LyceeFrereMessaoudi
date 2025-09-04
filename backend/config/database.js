const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

// Construit une URI MongoDB Atlas si les variables séparées sont fournies
const buildMongoUri = () => {
  const atlasUser = process.env.ATLAS_USER;
  const atlasPass = process.env.ATLAS_PASS;
  const atlasCluster = process.env.ATLAS_CLUSTER; // ex: cluster0.xxxxx
  const atlasDb = process.env.ATLAS_DB || 'lycee-messaoudi';
  const atlasAppName = process.env.ATLAS_APPNAME || 'LyceeMessaoudi';
  if (atlasUser && atlasPass && atlasCluster) {
    return `mongodb+srv://${encodeURIComponent(atlasUser)}:${encodeURIComponent(atlasPass)}@${atlasCluster}.mongodb.net/${atlasDb}?retryWrites=true&w=majority&appName=${encodeURIComponent(atlasAppName)}`;
  }
  return null;
};

// Configuration de la connexion MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || buildMongoUri();
    if (!mongoUri) {
      throw new Error('Aucune URI MongoDB fournie. Définissez MONGODB_URI ou ATLAS_USER/ATLAS_PASS/ATLAS_CLUSTER.');
    }

    const conn = await mongoose.connect(mongoUri, {
      // Options par défaut de Mongoose v7+, inutile d'ajouter useNewUrlParser/useUnifiedTopology
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL || '10', 10),
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`);
    
    // Configuration des options de connexion
    mongoose.connection.on('error', (err) => {
      console.error('Erreur de connexion MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB déconnecté');
    });

    // Gestion de la fermeture propre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée');
      process.exit(0);
    });

  } catch (error) {
    console.error('Erreur lors de la connexion à MongoDB:', error);
    process.exit(1);
  }
};

// Fonction pour initialiser les données de base
const initializeData = async () => {
  try {
    const { Role, User, Specialty, Subject } = require('../models');
    
    // Vérifier si les rôles existent déjà
    const existingRoles = await Role.countDocuments();
    if (existingRoles === 0) {
      console.log('Initialisation des rôles...');
      
      const roles = [
        {
          name: 'admin',
          permissions: ['*'],
          description: 'Administrateur système avec tous les droits'
        },
        {
          name: 'teacher',
          permissions: [
            'students:read',
            'students:update',
            'absences:create',
            'absences:read',
            'absences:update',
            'incidents:create',
            'incidents:read',
            'incidents:update'
          ],
          description: 'Enseignant avec droits limités'
        },
        {
          name: 'parent',
          permissions: [
            'students:read',
            'absences:read',
            'incidents:read'
          ],
          description: 'Parent avec accès en lecture seule'
        },
        {
          name: 'student',
          permissions: [
            'students:read'
          ],
          description: 'Élève avec accès limité'
        }
      ];

      await Role.insertMany(roles);
      console.log('Rôles initialisés avec succès');
    }

    // Vérifier si l'utilisateur admin existe déjà
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      console.log('Création de l\'utilisateur admin...');
      
      const bcrypt = require('bcryptjs');
      const adminRole = await Role.findOne({ name: 'admin' });
      
      const adminUser = new User({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12),
        role: adminRole._id,
        firstName: process.env.ADMIN_NAME || 'Administrateur',
        lastName: 'Système',
        isActive: true
      });

      await adminUser.save();
      console.log('Utilisateur admin créé avec succès');
    }

    // Vérifier si les spécialités existent déjà
    const existingSpecialties = await Specialty.countDocuments();
    if (existingSpecialties === 0) {
      console.log('Initialisation des spécialités...');
      
      const specialties = [
        { name: 'Sciences Expérimentales', code: 'SE' },
        { name: 'Mathématiques', code: 'MATH' },
        { name: 'Sciences Techniques', code: 'ST' },
        { name: 'Lettres', code: 'LET' },
        { name: 'Langues', code: 'LANG' },
        { name: 'Économie et Gestion', code: 'EG' }
      ];

      await Specialty.insertMany(specialties);
      console.log('Spécialités initialisées avec succès');
    }

    // Vérifier si les matières existent déjà
    const existingSubjects = await Subject.countDocuments();
    if (existingSubjects === 0) {
      console.log('Initialisation des matières...');
      
      const subjects = [
        { name: 'Mathématiques', code: 'MATH', hoursPerWeek: 6 },
        { name: 'Physique', code: 'PHY', hoursPerWeek: 4 },
        { name: 'Chimie', code: 'CHIM', hoursPerWeek: 3 },
        { name: 'Biologie', code: 'BIO', hoursPerWeek: 3 },
        { name: 'Français', code: 'FR', hoursPerWeek: 4 },
        { name: 'Anglais', code: 'ANG', hoursPerWeek: 3 },
        { name: 'Arabe', code: 'AR', hoursPerWeek: 4 },
        { name: 'Histoire-Géographie', code: 'HG', hoursPerWeek: 3 },
        { name: 'Philosophie', code: 'PHIL', hoursPerWeek: 2 },
        { name: 'Informatique', code: 'INFO', hoursPerWeek: 2 }
      ];

      await Subject.insertMany(subjects);
      console.log('Matières initialisées avec succès');
    }

    console.log('Initialisation des données terminée');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données:', error);
  }
};

module.exports = {
  connectDB,
  initializeData
};
