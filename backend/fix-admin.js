const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/database');

async function fixAdminUser() {
  try {
    console.log('🔧 Correction de l\'utilisateur admin...\n');
    
    // Connexion à MongoDB (Atlas ou URI fourni) via la même logique que l'application
    await connectDB();
    
    const { Role, User } = require('./models');
    
    // 1. Vérifier les rôles
    console.log('\n1️⃣ Vérification des rôles...');
    const roles = await Role.find();
    console.log('📊 Rôles disponibles:', roles.map(r => ({ id: r._id, name: r.name })));
    
    // 2. Trouver le rôle admin
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      throw new Error('Rôle admin non trouvé');
    }
    console.log('✅ Rôle admin trouvé:', adminRole._id);
    
    // 3. Vérifier l'utilisateur admin
    console.log('\n2️⃣ Vérification de l\'utilisateur admin...');
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      throw new Error('Utilisateur admin non trouvé');
    }
    console.log('✅ Utilisateur admin trouvé:', adminUser.username);
    console.log('📊 Rôle actuel:', adminUser.role || 'Aucun rôle');
    
    // 4. Corriger données requises et référence du rôle
    let changed = false;
    if (!adminUser.role || adminUser.role.toString() !== adminRole._id.toString()) {
      console.log('🔄 Attribution du rôle admin...');
      adminUser.role = adminRole._id;
      changed = true;
    }
    if (!adminUser.firstName) {
      adminUser.firstName = process.env.ADMIN_NAME || 'Administrateur';
      changed = true;
    }
    if (!adminUser.lastName) {
      adminUser.lastName = 'Système';
      changed = true;
    }
    if (!adminUser.email) {
      adminUser.email = process.env.ADMIN_EMAIL || 'admin@example.com';
      changed = true;
    }
    if (!adminUser.password) {
      adminUser.password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
      changed = true;
    }
    if (changed) {
      await adminUser.save();
      console.log('✅ Admin mis à jour');
    } else {
      console.log('✅ Aucune mise à jour nécessaire');
    }
    
    // 5. Vérifier la correction
    console.log('\n3️⃣ Vérification de la correction...');
    const fixedAdmin = await User.findOne({ username: 'admin' }).populate('role');
    if (fixedAdmin && fixedAdmin.role) {
      console.log('✅ Admin corrigé:', {
        username: fixedAdmin.username,
        email: fixedAdmin.email,
        role: fixedAdmin.role.name,
        permissions: fixedAdmin.role.permissions
      });
    } else {
      console.log('❌ Problème persistant');
    }
    
    console.log('\n🎯 Correction terminée');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

fixAdminUser(); 