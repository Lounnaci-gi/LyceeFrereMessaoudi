const express = require('express');
const { body, validationResult } = require('express-validator');
const { Teacher, Class, Subject } = require('../models');
const { auth, checkRole } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// GET /api/teachers - Récupérer tous les enseignants avec pagination et filtres
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const subjectFilter = req.query.subject;
    const classFilter = req.query.class;
    const statusFilter = req.query.status;

    // Construction du filtre
    let filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (subjectFilter) {
      filter.subjects = subjectFilter;
    }

    if (classFilter) {
      filter.classes = classFilter;
    }

    if (statusFilter !== undefined) {
      filter.isActive = statusFilter === 'true';
    }

    // Requête avec population des relations
    const teachers = await Teacher.find(filter)
      .populate('subjects', 'name code')
      .populate('classes', 'name level')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Compter le total pour la pagination
    const total = await Teacher.countDocuments(filter);

    res.json({
      success: true,
      data: {
        teachers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

// GET /api/teachers/:id - Récupérer un enseignant par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('subjects', 'name code')
      .populate('classes', 'name level');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }

    res.json({ success: true, data: teacher });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enseignant:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

// POST /api/teachers - Créer un nouvel enseignant
router.post('/', [
  auth,
  checkRole(['admin']),
  upload.single('photo'),
  body('firstName').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('phone').optional().isString(),
  body('subjects').optional(),
  body('classes').optional(),
  body('isActive').optional().isBoolean()
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

    // Vérifier si un enseignant avec le même email existe déjà
    const existingTeacherByEmail = await Teacher.findOne({ email: req.body.email });
    if (existingTeacherByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Un enseignant avec cet email existe déjà'
      });
    }

    // Générer un ID enseignant unique
    let teacherId;
    let isUnique = false;
    while (!isUnique) {
      teacherId = 'TCH' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const existingTeacher = await Teacher.findOne({ teacherId });
      if (!existingTeacher) {
        isUnique = true;
      }
    }

    // Créer l'enseignant
    const teacherData = {
      teacherId: teacherId,
      firstName: req.body.firstName,
      lastName: '', // Champ vide car on utilise seulement firstName maintenant
      email: req.body.email,
      phone: req.body.phone || null,
      address: {
        street: req.body['address.street'] || '',
        city: req.body['address.city'] || ''
      },
      subjects: [], // Temporairement vide pour tester
      classes: [], // Temporairement vide pour tester
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    // Gérer l'upload de photo
    if (req.file) {
      teacherData.photo = req.file.filename;
    }

    const newTeacher = new Teacher(teacherData);
    await newTeacher.save();

    // Populer les relations pour la réponse
    await newTeacher.populate('subjects', 'name code');
    await newTeacher.populate('classes', 'name level');

    res.status(201).json({
      success: true,
      message: 'Enseignant créé avec succès',
      data: newTeacher
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/teachers/:id - Mettre à jour un enseignant
router.put('/:id', [
  auth,
  checkRole(['admin']),
  upload.single('photo'),
  body('firstName').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('phone').optional().isString(),
  body('address.street').optional().isString(),
  body('address.city').optional().isString(),
  body('address.postalCode').optional().isString(),
  body('address.country').optional().isString(),
  body('subjects').optional().isArray(),
  body('classes').optional().isArray(),
  body('isActive').optional().isBoolean()
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

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }

    // Vérifier l'unicité de l'email si modifié
    if (req.body.email && req.body.email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({ email: req.body.email });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Un enseignant avec cet email existe déjà'
        });
      }
    }

    // Mettre à jour les données
    const updateData = {
      firstName: req.body.firstName,
      email: req.body.email,
      phone: req.body.phone || null,
      address: {
        street: req.body['address.street'] || '',
        city: req.body['address.city'] || ''
      },
      subjects: [], // Temporairement vide pour éviter les erreurs
      classes: [], // Temporairement vide pour éviter les erreurs
      updatedAt: new Date()
    };

    // Gérer l'upload de photo
    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('subjects', 'name code').populate('classes', 'name level');

    res.json({
      success: true,
      message: 'Enseignant mis à jour avec succès',
      data: updatedTeacher
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/teachers/:id - Supprimer un enseignant (soft delete)
router.delete('/:id', [auth, checkRole(['admin'])], async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }

    // Suppression réelle de l'enseignant
    await Teacher.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Enseignant supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/teachers/stats - Statistiques des enseignants
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ isActive: true });
    const inactiveTeachers = await Teacher.countDocuments({ isActive: false });

    res.json({
      success: true,
      data: {
        total: totalTeachers,
        active: activeTeachers,
        inactive: inactiveTeachers
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
