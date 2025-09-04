const express = require('express');
const { body, validationResult } = require('express-validator');
const { Specialty } = require('../models');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/specialties - Liste des spécialités
router.get('/', auth, async (req, res) => {
  try {
    const specialties = await Specialty.find({ isActive: true })
      .sort({ name: 1 });

    res.json({ success: true, data: specialties });
  } catch (error) {
    console.error('Erreur lors de la récupération des spécialités:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

// POST /api/specialties - Créer une nouvelle spécialité
router.post('/', [
  auth,
  checkRole(['admin', 'teacher']),
  body('name').notEmpty().withMessage('Le nom de la spécialité est requis'),
  body('code').notEmpty().withMessage('Le code de la spécialité est requis'),
  body('description').optional().isString().withMessage('La description doit être une chaîne de caractères')
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

    // Vérifier si une spécialité avec le même nom existe déjà
    const existingSpecialtyByName = await Specialty.findOne({ name: req.body.name });
    if (existingSpecialtyByName) {
      return res.status(400).json({
        success: false,
        message: 'Une spécialité avec ce nom existe déjà'
      });
    }

    // Vérifier si une spécialité avec le même code existe déjà
    const existingSpecialtyByCode = await Specialty.findOne({ code: req.body.code });
    if (existingSpecialtyByCode) {
      return res.status(400).json({
        success: false,
        message: 'Une spécialité avec ce code existe déjà'
      });
    }

    // Créer la spécialité
    const specialtyData = {
      name: req.body.name,
      code: req.body.code,
      description: req.body.description || null
    };

    const newSpecialty = new Specialty(specialtyData);
    await newSpecialty.save();

    res.status(201).json({
      success: true,
      message: 'Spécialité créée avec succès',
      data: newSpecialty
    });

  } catch (error) {
    console.error('Erreur lors de la création de la spécialité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
