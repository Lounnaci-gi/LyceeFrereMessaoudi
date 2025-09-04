require('dotenv').config();
const mongoose = require('mongoose');

// Test de connexion et d'initialisation
async function debugInitialization() {
  try {
    console.log('🔍 Débogage de l\'initialisation...\n');
    
    // 1. Test de connexion MongoDB
    console.log('1️⃣ Test de connexion MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté:', conn.connection.host);
    
    // 2. Test des modèles
    console.log('\n2️⃣ Test des modèles...');
    const { Role, User, Specialty, Subject } = require('./models');
    console.log('✅ Modèles chargés');
    
    // 3. Test de création des rôles
    console.log('\n3️⃣ Test de création des rôles...');
    try {
      const existingRoles = await Role.countDocuments();
      console.log('📊 Rôles existants:', existingRoles);
      
      if (existingRoles === 0) {
        console.log('🔄 Création des rôles...');
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
        
        const createdRoles = await Role.insertMany(roles);
        console.log('✅ Rôles créés:', createdRoles.length);
      } else {
        console.log('✅ Rôles déjà existants');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création des rôles:', error.message);
    }
    
    // 4. Test de création de l'utilisateur admin
    console.log('\n4️⃣ Test de création de l\'utilisateur admin...');
    try {
      const existingAdmin = await User.findOne({ username: 'admin' });
      console.log('📊 Admin existant:', existingAdmin ? 'Oui' : 'Non');
      
      if (!existingAdmin) {
        console.log('🔄 Création de l\'utilisateur admin...');
        const bcrypt = require('bcryptjs');
        const adminRole = await Role.findOne({ name: 'admin' });
        
        if (!adminRole) {
          throw new Error('Rôle admin non trouvé');
        }
        
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
        console.log('✅ Utilisateur admin créé');
      } else {
        console.log('✅ Utilisateur admin déjà existant');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    }
    
    // 5. Test de connexion
    console.log('\n5️⃣ Test de connexion admin...');
    try {
      const adminUser = await User.findOne({ username: 'admin' }).populate('role');
      if (adminUser) {
        console.log('✅ Admin trouvé:', {
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role.name,
          permissions: adminUser.role.permissions
        });
      } else {
        console.log('❌ Admin non trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de l\'admin:', error.message);
    }
    
    console.log('\n🎯 Débogage terminé');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le débogage
debugInitialization(); 