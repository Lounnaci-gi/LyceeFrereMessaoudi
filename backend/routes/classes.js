const express = require('express');
const { body, validationResult } = require('express-validator');
const { Class, Specialty } = require('../models');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/classes - Liste des classes avec spécialité
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('specialty', 'name code')
      .sort({ level: 1, name: 1 });

    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

// GET /api/classes/specialties - Liste des spécialités
router.get('/specialties', auth, async (req, res) => {
  try {
    const specialties = await Specialty.find({ isActive: true })
      .sort({ name: 1 });

    res.json({ success: true, data: specialties });
  } catch (error) {
    console.error('Erreur lors de la récupération des spécialités:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

// POST /api/classes - Créer une nouvelle classe
router.post('/', [
  auth,
  checkRole(['admin', 'teacher']),
  body('name').notEmpty().withMessage('Le nom de la classe est requis'),
  body('level').isIn(['1ère année', '2ème année', '3ème année']).withMessage('Niveau invalide'),
  body('academicYear').notEmpty().withMessage('L\'année académique est requise'),
  body('specialty').optional().isMongoId().withMessage('Spécialité invalide'),
  body('capacity').optional().isInt({ min: 1, max: 50 }).withMessage('La capacité doit être entre 1 et 50')
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

    // Vérifier si la spécialité existe (si fournie)
    if (req.body.specialty) {
      const specialtyExists = await Specialty.findById(req.body.specialty);
      if (!specialtyExists) {
        return res.status(400).json({
          success: false,
          message: 'Spécialité non trouvée'
        });
      }
    }

    // Vérifier si une classe avec le même nom et niveau existe déjà
    const existingClass = await Class.findOne({ 
      name: req.body.name, 
      level: req.body.level,
      academicYear: req.body.academicYear 
    });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Une classe avec ce nom et niveau existe déjà pour cette année académique'
      });
    }

    // Créer la classe
    const classData = {
      ...req.body,
      capacity: req.body.capacity || 30
    };

    const newClass = new Class(classData);
    await newClass.save();

    // Récupérer la classe avec les relations populées
    const populatedClass = await Class.findById(newClass._id)
      .populate('specialty', 'name code');

    res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      data: populatedClass
    });

  } catch (error) {
    console.error('Erreur lors de la création de la classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;

