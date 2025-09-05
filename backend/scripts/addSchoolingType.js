const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à la base de données
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lycee-freres-messaoudi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import du modèle Student
const { Student } = require('../models');

async function addSchoolingTypeToExistingStudents() {
  try {
    console.log('Début de la mise à jour des élèves...');
    
    // Mettre à jour tous les élèves qui n'ont pas de schoolingType
    const result = await Student.updateMany(
      { schoolingType: { $exists: false } },
      { $set: { schoolingType: 'externe' } } // Valeur par défaut
    );
    
    console.log(`${result.modifiedCount} élèves mis à jour avec le type de scolarité par défaut (externe)`);
    
    // Vérifier le résultat
    const studentsWithoutSchoolingType = await Student.countDocuments({ schoolingType: { $exists: false } });
    console.log(`Il reste ${studentsWithoutSchoolingType} élèves sans type de scolarité`);
    
    console.log('Mise à jour terminée avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Exécuter le script
addSchoolingTypeToExistingStudents();
