const mongoose = require('mongoose');
const { Class, Specialty } = require('../models');
require('dotenv').config({ path: require('path').join(__dirname, '../config.env') });

// Configuration de connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connecté');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Données des classes à insérer
const classesData = [
  // 1ère année
  { name: '1ère A', level: '1ère année', academicYear: '2024-2025', capacity: 30 },
  { name: '1ère B', level: '1ère année', academicYear: '2024-2025', capacity: 30 },
  { name: '1ère C', level: '1ère année', academicYear: '2024-2025', capacity: 30 },
  { name: '1ère D', level: '1ère année', academicYear: '2024-2025', capacity: 30 },
  { name: '1ère E', level: '1ère année', academicYear: '2024-2025', capacity: 30 },
  
  // 2ème année
  { name: '2ème A', level: '2ème année', academicYear: '2024-2025', capacity: 30 },
  { name: '2ème B', level: '2ème année', academicYear: '2024-2025', capacity: 30 },
  { name: '2ème C', level: '2ème année', academicYear: '2024-2025', capacity: 30 },
  { name: '2ème D', level: '2ème année', academicYear: '2024-2025', capacity: 30 },
  { name: '2ème E', level: '2ème année', academicYear: '2024-2025', capacity: 30 },
  
  // 3ème année
  { name: '3ème A', level: '3ème année', academicYear: '2024-2025', capacity: 30 },
  { name: '3ème B', level: '3ème année', academicYear: '2024-2025', capacity: 30 },
  { name: '3ème C', level: '3ème année', academicYear: '2024-2025', capacity: 30 },
  { name: '3ème D', level: '3ème année', academicYear: '2024-2025', capacity: 30 },
  { name: '3ème E', level: '3ème année', academicYear: '2024-2025', capacity: 30 }
];

const insertClasses = async () => {
  try {
    await connectDB();
    
    // Récupérer les spécialités existantes
    const specialties = await Specialty.find({ isActive: true });
    console.log(`Trouvé ${specialties.length} spécialités`);
    
    if (specialties.length === 0) {
      console.log('Aucune spécialité trouvée. Création de spécialités par défaut...');
      
      const defaultSpecialties = [
        { name: 'Sciences', code: 'SCI', description: 'Spécialité Sciences' },
        { name: 'Lettres', code: 'LET', description: 'Spécialité Lettres' },
        { name: 'Mathématiques', code: 'MATH', description: 'Spécialité Mathématiques' },
        { name: 'Langues', code: 'LANG', description: 'Spécialité Langues' },
        { name: 'Histoire-Géographie', code: 'HG', description: 'Spécialité Histoire-Géographie' }
      ];
      
      for (const specialty of defaultSpecialties) {
        const newSpecialty = new Specialty(specialty);
        await newSpecialty.save();
        console.log(`Spécialité créée: ${specialty.name}`);
      }
      
      // Récupérer à nouveau les spécialités
      const updatedSpecialties = await Specialty.find({ isActive: true });
      specialties.push(...updatedSpecialties);
    }
    
    // Assigner des spécialités aux classes
    const classesWithSpecialties = classesData.map((classData, index) => {
      const specialtyIndex = index % specialties.length;
      return {
        ...classData,
        specialty: specialties[specialtyIndex]._id
      };
    });
    
    // Vérifier si les classes existent déjà
    const existingClasses = await Class.find({ academicYear: '2024-2025' });
    if (existingClasses.length > 0) {
      console.log(`Suppression de ${existingClasses.length} classes existantes...`);
      await Class.deleteMany({ academicYear: '2024-2025' });
    }
    
    // Insérer les nouvelles classes
    console.log('Insertion des 15 classes...');
    const insertedClasses = await Class.insertMany(classesWithSpecialties);
    
    console.log(`✅ ${insertedClasses.length} classes insérées avec succès !`);
    
    // Afficher un résumé
    const summary = insertedClasses.reduce((acc, cls) => {
      acc[cls.level] = (acc[cls.level] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Résumé des classes créées:');
    Object.entries(summary).forEach(([level, count]) => {
      console.log(`  ${level}: ${count} classes`);
    });
    
    console.log('\n🎯 Classes créées:');
    insertedClasses.forEach(cls => {
      const specialty = specialties.find(s => s._id.toString() === cls.specialty.toString());
      console.log(`  - ${cls.name} (${cls.level}) - ${specialty ? specialty.name : 'Sans spécialité'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des classes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Exécuter le script
insertClasses();
