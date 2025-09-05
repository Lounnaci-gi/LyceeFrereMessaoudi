const express = require('express');
const { body, validationResult } = require('express-validator');
const { Student, Parent, Class, Specialty } = require('../models');
const { auth, checkRole } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// GET /api/students - Récupérer tous les étudiants avec pagination et filtres
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const classFilter = req.query.class;
    const specialtyFilter = req.query.specialty;
    const genderFilter = req.query.gender;
    const schoolingTypeFilter = req.query.schoolingType;

    // Construction du filtre
    let filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (classFilter) {
      filter.class = classFilter;
    }

    if (genderFilter) {
      filter.gender = genderFilter;
    }

    if (schoolingTypeFilter) {
      filter.schoolingType = schoolingTypeFilter;
    }

    // Requête avec population des relations
    const students = await Student.find(filter)
      .populate('class', 'name level specialty')
      .populate('class.specialty', 'name code')
      .populate('parents.parent', 'firstName lastName email phone')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Compter le total pour la pagination
    const total = await Student.countDocuments(filter);

    // Appliquer le filtre de spécialité après population
    let filteredStudents = students;
    if (specialtyFilter) {
      filteredStudents = students.filter(student => 
        student.class.specialty && student.class.specialty._id.toString() === specialtyFilter
      );
    }

    res.json({
      success: true,
      data: {
        students: filteredStudents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/students/stats - Statistiques pour le dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    // Compter le total des élèves
    const totalStudents = await Student.countDocuments({ isActive: true });
    
    // Compter par genre
    const maleCount = await Student.countDocuments({ gender: 'male', isActive: true });
    const femaleCount = await Student.countDocuments({ gender: 'female', isActive: true });
    
    // Compter par classe
    const studentsByClass = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classInfo' } },
      { $unwind: '$classInfo' },
      { $project: { className: '$classInfo.name', count: 1 } }
    ]);
    
    // Compter par spécialité
    const studentsBySpecialty = await Student.aggregate([
      { $match: { isActive: true } },
      { $lookup: { from: 'classes', localField: 'class', foreignField: '_id', as: 'classInfo' } },
      { $unwind: '$classInfo' },
      { $lookup: { from: 'specialties', localField: 'classInfo.specialty', foreignField: '_id', as: 'specialtyInfo' } },
      { $unwind: '$specialtyInfo' },
      { $group: { _id: '$specialtyInfo.name', count: { $sum: 1 } } },
      { $project: { specialtyName: '$_id', count: 1, _id: 0 } }
    ]);
    
    // Compter les élèves récemment inscrits (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentStudents = await Student.countDocuments({ 
      isActive: true, 
      enrollmentDate: { $gte: thirtyDaysAgo } 
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        genderStats: {
          male: maleCount,
          female: femaleCount
        },
        studentsByClass,
        studentsBySpecialty,
        recentStudents
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/students/:id - Récupérer un étudiant par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name level specialty academicYear')
      .populate('class.specialty', 'name code')
      .populate('parents.parent', 'firstName lastName email phone address relationship');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/students - Créer un nouvel étudiant
router.post('/', [
  auth,
  checkRole(['admin', 'teacher']),
  upload.single('photo'),
  body('studentId').optional().isString().withMessage('L\'identifiant étudiant doit être une chaîne de caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom de famille est requis'),
  body('dateOfBirth').isISO8601().withMessage('Date de naissance invalide'),
  body('gender').isIn(['male', 'female']).withMessage('Genre invalide'),
  body('class').isMongoId().withMessage('Classe invalide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('schoolingType').isIn(['externe', 'demi-pensionnaire']).withMessage('Type de scolarité invalide')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    // Vérifier si l'identifiant étudiant existe déjà
    const existingStudent = await Student.findOne({ studentId: req.body.studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Un étudiant avec cet identifiant existe déjà'
      });
    }

    // Vérifier si l'email existe déjà (si fourni)
    if (req.body.email) {
      const existingEmail = await Student.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Un étudiant avec cet email existe déjà'
        });
      }
    }

    // Vérifier si la classe existe
    const classExists = await Class.findById(req.body.class);
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    // Préparer les données de l'étudiant
    const studentData = {
      ...req.body,
      dateOfBirth: new Date(req.body.dateOfBirth),
      photo: req.file ? req.file.filename : null,
      parents: req.body.parents ? JSON.parse(req.body.parents) : []
    };

    // Créer l'étudiant
    const student = new Student(studentData);
    await student.save();

    // Générer un studentId basé sur l'ObjectId si non fourni
    if (!student.studentId) {
      const year = new Date().getFullYear();
      const studentNumber = student._id.toString().slice(-6).toUpperCase();
      student.studentId = `${year}${studentNumber}`;
      await student.save();
    }

    // Récupérer l'étudiant avec les relations populées
    const populatedStudent = await Student.findById(student._id)
      .populate('class', 'name level specialty')
      .populate('class.specialty', 'name code')
      .populate('parents.parent', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Étudiant créé avec succès',
      data: populatedStudent
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'étudiant:', error);
    
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      handleUploadError(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/students/:id - Mettre à jour un étudiant
router.put('/:id', [
  auth,
  checkRole(['admin', 'teacher']),
  upload.single('photo'),
  body('firstName').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().notEmpty().withMessage('Le nom de famille ne peut pas être vide'),
  body('dateOfBirth').optional().isISO8601().withMessage('Date de naissance invalide'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Genre invalide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('schoolingType').optional().isIn(['externe', 'demi-pensionnaire']).withMessage('Type de scolarité invalide')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    // Vérifier si l'email existe déjà (si modifié)
    if (req.body.email && req.body.email !== student.email) {
      const existingEmail = await Student.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Un étudiant avec cet email existe déjà'
        });
      }
    }

    // Préparer les données de mise à jour
    const updateData = { ...req.body };
    
    if (req.body.dateOfBirth) {
      updateData.dateOfBirth = new Date(req.body.dateOfBirth);
    }

    if (req.file) {
      // Supprimer l'ancienne photo si elle existe
      if (student.photo) {
        handleUploadError(student.photo);
      }
      updateData.photo = req.file.filename;
    }

    if (req.body.parents) {
      updateData.parents = JSON.parse(req.body.parents);
    }

    updateData.updatedAt = new Date();

    // Mettre à jour l'étudiant
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('class', 'name level specialty')
     .populate('class.specialty', 'name code')
     .populate('parents.parent', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Étudiant mis à jour avec succès',
      data: updatedStudent
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
    
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      handleUploadError(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/students/:id - Supprimer un étudiant (soft delete)
router.delete('/:id', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    // Soft delete
    student.isActive = false;
    student.updatedAt = new Date();
    await student.save();

    res.json({
      success: true,
      message: 'Étudiant supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
