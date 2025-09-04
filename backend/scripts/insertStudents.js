const mongoose = require('mongoose');
const { Student, Class } = require('../models');
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

// Noms arabes
const nomsArabes = [
  'محمد', 'أحمد', 'علي', 'عمر', 'يوسف', 'كريم', 'سعيد', 'حسن', 'عبد', 'مصطفى',
  'رشيد', 'نبيل', 'فريد', 'سمير', 'طارق', 'وليد', 'ياسين', 'زين الدين', 'بلال', 'إبراهيم',
  'خليل', 'مالك', 'ناصر', 'أسامة', 'رضا', 'سفيان', 'تارق', 'يانس', 'زكريا', 'أمين',
  'عبد الله', 'عبد الرحمن', 'عبد العزيز', 'عبد الكريم', 'عبد المجيد', 'عبد المالك', 'عبد الوهاب', 'عبد الرزاق'
];

// Prénoms arabes masculins
const prenomsMasculins = [
  'محمد', 'أحمد', 'علي', 'عمر', 'يوسف', 'كريم', 'سعيد', 'حسن', 'عبد الله', 'مصطفى',
  'رشيد', 'نبيل', 'فريد', 'سمير', 'طارق', 'وليد', 'ياسين', 'زين الدين', 'بلال', 'إبراهيم',
  'خليل', 'مالك', 'ناصر', 'أسامة', 'رضا', 'سفيان', 'تارق', 'يانس', 'زكريا', 'أمين',
  'عبد الرحمن', 'عبد العزيز', 'عبد الكريم', 'عبد المجيد', 'عبد المالك', 'عبد الوهاب', 'عبد الرزاق', 'عبد الحميد'
];

// Prénoms arabes féminins
const prenomsFeminins = [
  'فاطمة', 'عائشة', 'خديجة', 'زينب', 'نور', 'سلمى', 'ياسمين', 'لينا', 'سارة', 'نادية',
  'سميرة', 'رانيا', 'جميلة', 'ملكة', 'ثريا', 'ليلى', 'نعيمة', 'هودا', 'كريمة', 'زكية',
  'أمينة', 'بشرى', 'شهرزاد', 'دنيا', 'إيفا', 'فاضلة', 'غانية', 'هبة', 'إيمان', 'جيهان',
  'مريم', 'زهرة', 'حياة', 'سعاد', 'فريدة', 'رحمة', 'صفية', 'عزيزة', 'حكيمة', 'راضية'
];

// Fonction pour générer une date de naissance aléatoire entre 2005 et 2009
const generateDateOfBirth = () => {
  const year = Math.floor(Math.random() * 5) + 2005; // 2005-2009
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Pour éviter les problèmes de jours inexistants
  return new Date(year, month - 1, day);
};

// Fonction pour translittérer l'arabe vers l'anglais pour l'email
const transliterateArabic = (text) => {
  const arabicToEnglish = {
    'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'a', 'ء': 'a', 'ؤ': 'w', 'ئ': 'y', ' ': ''
  };
  
  return text.split('').map(char => arabicToEnglish[char] || char).join('');
};

// Fonction pour générer un email basé sur le nom et prénom
const generateEmail = (prenom, nom, index) => {
  const prenomTranslit = transliterateArabic(prenom);
  const nomTranslit = transliterateArabic(nom);
  const baseEmail = `${prenomTranslit}.${nomTranslit}`;
  const email = `${baseEmail}${index + 1}@lycee.edu.dz`;
  return email;
};

// Fonction pour générer un numéro de téléphone algérien
const generatePhone = () => {
  const prefixes = ['055', '056', '066', '067', '077', '078'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
};

// Fonction pour générer un studentId unique
const generateStudentId = (index) => {
  const year = new Date().getFullYear();
  const studentNumber = (index + 1).toString().padStart(4, '0');
  return `${year}${studentNumber}`;
};

const insertStudents = async () => {
  try {
    await connectDB();
    
    // Récupérer toutes les classes disponibles
    const classes = await Class.find({ isActive: true }).populate('specialty', 'name');
    console.log(`Trouvé ${classes.length} classes disponibles`);
    
    if (classes.length === 0) {
      console.log('❌ Aucune classe trouvée. Veuillez d\'abord créer des classes.');
      return;
    }
    
    // Vérifier s'il y a déjà des élèves
    const existingStudents = await Student.find();
    if (existingStudents.length > 0) {
      console.log(`Suppression de ${existingStudents.length} élèves existants...`);
      await Student.deleteMany({});
    }
    
    const students = [];
    
    // Générer 40 élèves
    for (let i = 0; i < 40; i++) {
      const isMale = Math.random() < 0.5; // 50% de chance d'être masculin
      const prenom = isMale 
        ? prenomsMasculins[Math.floor(Math.random() * prenomsMasculins.length)]
        : prenomsFeminins[Math.floor(Math.random() * prenomsFeminins.length)];
      
      const nom = nomsArabes[Math.floor(Math.random() * nomsArabes.length)];
      const dateOfBirth = generateDateOfBirth();
      const gender = isMale ? 'male' : 'female';
      const email = generateEmail(prenom, nom, i);
      const phone = generatePhone();
      
      // Sélectionner une classe aléatoire
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      
      // Générer une adresse aléatoire
      const wilayas = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Batna', 'Djelfa', 'Sidi Bel Abbès', 'Biskra'];
      const wilaya = wilayas[Math.floor(Math.random() * wilayas.length)];
      
      const student = {
        studentId: generateStudentId(i),
        firstName: prenom,
        lastName: nom,
        dateOfBirth: dateOfBirth,
        gender: gender,
        email: email,
        phone: phone,
        class: randomClass._id,
        address: {
          street: `Rue ${Math.floor(Math.random() * 100) + 1}`,
          city: wilaya,
          postalCode: Math.floor(Math.random() * 90000) + 10000,
          country: 'Algérie'
        },
        isActive: true
      };
      
      students.push(student);
    }
    
    // Insérer tous les élèves
    console.log('Insertion des 40 élèves...');
    const insertedStudents = await Student.insertMany(students);
    
    console.log(`✅ ${insertedStudents.length} élèves insérés avec succès !`);
    
    // Afficher un résumé par genre
    const maleCount = insertedStudents.filter(s => s.gender === 'male').length;
    const femaleCount = insertedStudents.filter(s => s.gender === 'female').length;
    
    console.log('\n📊 Résumé des élèves créés:');
    console.log(`  👨 Masculins: ${maleCount}`);
    console.log(`  👩 Féminins: ${femaleCount}`);
    
    // Afficher un résumé par classe
    const classSummary = {};
    insertedStudents.forEach(student => {
      const classId = student.class.toString();
      if (!classSummary[classId]) {
        classSummary[classId] = { count: 0, className: '' };
      }
      classSummary[classId].count++;
    });
    
    // Récupérer les noms des classes
    for (const classId in classSummary) {
      const classInfo = classes.find(c => c._id.toString() === classId);
      if (classInfo) {
        classSummary[classId].className = classInfo.name;
      }
    }
    
    console.log('\n🎯 Répartition par classe:');
    Object.values(classSummary).forEach(info => {
      console.log(`  ${info.className}: ${info.count} élèves`);
    });
    
    // Afficher quelques exemples
    console.log('\n👥 Exemples d\'élèves créés:');
    insertedStudents.slice(0, 10).forEach((student, index) => {
      const classInfo = classes.find(c => c._id.toString() === student.class.toString());
      const age = new Date().getFullYear() - student.dateOfBirth.getFullYear();
      console.log(`  ${index + 1}. ${student.firstName} ${student.lastName} (${student.gender === 'male' ? 'M' : 'F'}, ${age} ans) - ${classInfo ? classInfo.name : 'Classe inconnue'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des élèves:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Exécuter le script
insertStudents();
