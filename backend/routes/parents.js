const express = require('express');
const { body, validationResult } = require('express-validator');
const { Parent, Student } = require('../models');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/parents - Récupérer tous les parents avec pagination et filtres
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const relationship = req.query.relationship || '';

    // Construction du filtre
    let filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (relationship) {
      filter.relationship = relationship;
    }

    // Requête avec pagination
    const parents = await Parent.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Parent.countDocuments(filter);

    // Pour chaque parent, récupérer les enfants associés
    const parentsWithChildren = await Promise.all(
      parents.map(async (parent) => {
        const children = await Student.find({ 
          'parents.parent': parent._id 
        })
          .populate('class', 'name level')
          .select('firstName lastName gender schoolingType class');
        
        return {
          ...parent.toObject(),
          children
        };
      })
    );

    res.json({
      success: true,
      data: {
        parents: parentsWithChildren,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des parents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des parents'
    });
  }
});

// GET /api/parents/:id - Récupérer un parent par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent non trouvé'
      });
    }

    // Récupérer les enfants associés
    const children = await Student.find({ 
      'parents.parent': parent._id 
    })
      .populate('class', 'name level')
      .select('firstName lastName gender schoolingType class');

    res.json({
      success: true,
      data: {
        ...parent.toObject(),
        children
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du parent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du parent'
    });
  }
});

// POST /api/parents - Créer un nouveau parent
router.post('/', auth, checkRole(['admin', 'teacher']), [
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom de famille est requis'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email invalide'),
  body('phone').optional().notEmpty().withMessage('Le téléphone ne peut pas être vide'),
  body('relationship').isIn(['father', 'mother', 'guardian']).withMessage('Relation invalide'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.postalCode').optional().trim(),
  body('address.country').optional().trim()
], async (req, res) => {
  try {
    console.log('POST /parents - Données reçues:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erreurs de validation:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    // Vérifier si l'email existe déjà (seulement si un email est fourni)
    if (req.body.email && req.body.email.trim()) {
      const existingParent = await Parent.findOne({ email: req.body.email });
      if (existingParent) {
        return res.status(400).json({
          success: false,
          message: 'Un parent avec cet email existe déjà'
        });
      }
    }

    const parent = new Parent(req.body);
    await parent.save();

    res.status(201).json({
      success: true,
      message: 'Parent créé avec succès',
      data: parent
    });
  } catch (error) {
    console.error('Erreur lors de la création du parent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du parent'
    });
  }
});

// PUT /api/parents/:id - Mettre à jour un parent
router.put('/:id', auth, checkRole(['admin', 'teacher']), [
  body('firstName').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().notEmpty().withMessage('Le nom de famille ne peut pas être vide'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email invalide'),
  body('phone').optional().notEmpty().withMessage('Le téléphone ne peut pas être vide'),
  body('relationship').optional().isIn(['father', 'mother', 'guardian']).withMessage('Relation invalide'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.postalCode').optional().trim(),
  body('address.country').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent non trouvé'
      });
    }

    // Vérifier si l'email existe déjà (si modifié)
    if (req.body.email && req.body.email !== parent.email) {
      const existingParent = await Parent.findOne({ email: req.body.email });
      if (existingParent) {
        return res.status(400).json({
          success: false,
          message: 'Un parent avec cet email existe déjà'
        });
      }
    }

    // Mise à jour des données
    Object.assign(parent, req.body);
    parent.updatedAt = new Date();
    await parent.save();

    res.json({
      success: true,
      message: 'Parent mis à jour avec succès',
      data: parent
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du parent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du parent'
    });
  }
});

// DELETE /api/parents/:id - Supprimer un parent
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent non trouvé'
      });
    }

    // Vérifier s'il y a des enfants associés
    const childrenCount = await Student.countDocuments({ 
      'parents.parent': parent._id 
    });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce parent car il a des enfants associés'
      });
    }

    await Parent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Parent supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du parent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du parent'
    });
  }
});

// GET /api/parents/stats - Statistiques des parents
router.get('/stats', auth, async (req, res) => {
  try {
    const totalParents = await Parent.countDocuments({ isActive: true });
    
    const relationshipStats = await Parent.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$relationship', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalParents,
        relationshipStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

module.exports = router;