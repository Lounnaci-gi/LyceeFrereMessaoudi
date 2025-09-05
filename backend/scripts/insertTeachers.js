const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../config.env') });

// Import du modèle Teacher
const { Teacher } = require('../models');

// Données des enseignants avec noms et adresses arabes
const teachersData = [
  {
    firstName: 'محمد أحمد',
    email: 'mohamed.ahmed@lycee-messaoudi.com',
    phone: '0661234567',
    address: {
      street: 'شارع الاستقلال رقم 15',
      city: 'الدار البيضاء'
    }
  },
  {
    firstName: 'فاطمة الزهراء',
    email: 'fatima.zahra@lycee-messaoudi.com',
    phone: '0662345678',
    address: {
      street: 'حي المعاريف شارع الحسن الثاني',
      city: 'الرباط'
    }
  },
  {
    firstName: 'عبد الرحمن بن علي',
    email: 'abderrahman.benali@lycee-messaoudi.com',
    phone: '0663456789',
    address: {
      street: 'شارع محمد الخامس رقم 42',
      city: 'فاس'
    }
  },
  {
    firstName: 'عائشة بنت محمد',
    email: 'aicha.bentmohamed@lycee-messaoudi.com',
    phone: '0664567890',
    address: {
      street: 'حي أكدال شارع الحسن الأول',
      city: 'الرباط'
    }
  },
  {
    firstName: 'يوسف بن عبد الله',
    email: 'youssef.benabdallah@lycee-messaoudi.com',
    phone: '0665678901',
    address: {
      street: 'شارع الجيش الملكي رقم 8',
      city: 'مراكش'
    }
  },
  {
    firstName: 'زينب بنت الحسن',
    email: 'zineb.bentelhassan@lycee-messaoudi.com',
    phone: '0666789012',
    address: {
      street: 'حي المعاريف شارع ابن سينا',
      city: 'الدار البيضاء'
    }
  },
  {
    firstName: 'عمر بن الخطاب',
    email: 'omar.benelkhattab@lycee-messaoudi.com',
    phone: '0667890123',
    address: {
      street: 'شارع الحسن الثاني رقم 25',
      city: 'طنجة'
    }
  },
  {
    firstName: 'خديجة بنت خويلد',
    email: 'khadija.bentkhuwaylid@lycee-messaoudi.com',
    phone: '0668901234',
    address: {
      street: 'حي أكدال شارع محمد السادس',
      city: 'الرباط'
    }
  },
  {
    firstName: 'عبد الله بن مسعود',
    email: 'abdallah.benmassoud@lycee-messaoudi.com',
    phone: '0669012345',
    address: {
      street: 'شارع الاستقلال رقم 33',
      city: 'فاس'
    }
  },
  {
    firstName: 'مريم بنت عمران',
    email: 'maryam.bentimran@lycee-messaoudi.com',
    phone: '0660123456',
    address: {
      street: 'حي المعاريف شارع الحسن الأول',
      city: 'الدار البيضاء'
    }
  },
  {
    firstName: 'سعد بن أبي وقاص',
    email: 'saad.benabiwakkas@lycee-messaoudi.com',
    phone: '0661234568',
    address: {
      street: 'شارع الجيش الملكي رقم 17',
      city: 'مراكش'
    }
  },
  {
    firstName: 'حفصة بنت عمر',
    email: 'hafsa.bentomar@lycee-messaoudi.com',
    phone: '0662345679',
    address: {
      street: 'حي أكدال شارع ابن سينا',
      city: 'الرباط'
    }
  },
  {
    firstName: 'طلحة بن عبيد الله',
    email: 'talha.benubaydallah@lycee-messaoudi.com',
    phone: '0663456780',
    address: {
      street: 'شارع محمد الخامس رقم 56',
      city: 'طنجة'
    }
  },
  {
    firstName: 'رقية بنت محمد',
    email: 'ruqayya.bentmohamed@lycee-messaoudi.com',
    phone: '0664567891',
    address: {
      street: 'حي المعاريف شارع الحسن الثاني',
      city: 'فاس'
    }
  },
  {
    firstName: 'عثمان بن عفان',
    email: 'othman.benaffan@lycee-messaoudi.com',
    phone: '0665678902',
    address: {
      street: 'شارع الاستقلال رقم 71',
      city: 'الدار البيضاء'
    }
  }
];

// Fonction pour générer un ID enseignant unique
const generateTeacherId = () => {
  return 'TCH' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Fonction pour insérer les enseignants
const insertTeachers = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si des enseignants existent déjà
    const existingTeachers = await Teacher.countDocuments();
    if (existingTeachers > 0) {
      console.log(`⚠️  ${existingTeachers} enseignants existent déjà dans la base de données`);
      console.log('Voulez-vous continuer ? (Ctrl+C pour annuler)');
      // Attendre 3 secondes pour permettre l'annulation
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Préparer les données avec les IDs générés
    const teachersToInsert = teachersData.map(teacherData => ({
      ...teacherData,
      teacherId: generateTeacherId(),
      lastName: '', // Champ vide comme configuré
      subjects: [],
      classes: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insérer les enseignants
    const result = await Teacher.insertMany(teachersToInsert);
    console.log(`✅ ${result.length} enseignants insérés avec succès !`);

    // Afficher la liste des enseignants créés
    console.log('\n📋 Liste des enseignants créés :');
    result.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.firstName} (${teacher.teacherId}) - ${teacher.email}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des enseignants:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    process.exit(0);
  }
};

// Exécuter le script
insertTeachers();
