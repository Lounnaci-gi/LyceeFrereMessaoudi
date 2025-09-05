import React from 'react';
import { motion } from 'framer-motion';

const ThemeDemo = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-adaptive-primary">Démonstration des Couleurs Adaptatives</h1>
        <p className="text-adaptive-secondary">Ce composant montre comment les couleurs s'adaptent automatiquement au thème</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cartes de démonstration */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-adaptive-primary">Texte Principal</h3>
            <p className="card-subtitle text-adaptive-secondary">Sous-titre adaptatif</p>
          </div>
          <div className="space-y-4">
            <p className="text-adaptive-primary">Ce texte s'adapte au thème (principal)</p>
            <p className="text-adaptive-secondary">Ce texte s'adapte au thème (secondaire)</p>
            <p className="text-adaptive-muted">Ce texte s'adapte au thème (atténué)</p>
            <p className="text-adaptive-subtle">Ce texte s'adapte au thème (subtile)</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-adaptive-primary">États et Statuts</h3>
            <p className="card-subtitle text-adaptive-secondary">Couleurs d'état adaptatives</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <span className="text-adaptive-success">Succès</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <span className="text-adaptive-warning">Avertissement</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
              <span className="text-adaptive-error">Erreur</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-adaptive-info">Information</span>
            </div>
          </div>
        </div>

        {/* Formulaire de démonstration */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-adaptive-primary">Formulaire</h3>
            <p className="card-subtitle text-adaptive-secondary">Éléments de formulaire adaptatifs</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-adaptive-label mb-2">
                Nom d'utilisateur
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Entrez votre nom d'utilisateur"
              />
              <p className="text-sm text-adaptive-help mt-1">
                Ce champ est obligatoire
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-adaptive-label mb-2">
                Email
              </label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="votre@email.com"
              />
            </div>
            <button className="btn-primary">Enregistrer</button>
          </div>
        </div>

        {/* Tableau de démonstration */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-adaptive-primary">Tableau</h3>
            <p className="card-subtitle text-adaptive-secondary">Données tabulaires adaptatives</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Nom</th>
                  <th className="table-header">Statut</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell">Utilisateur 1</td>
                  <td className="table-cell">
                    <span className="badge badge-success">Actif</span>
                  </td>
                  <td className="table-cell-muted">2024-01-15</td>
                </tr>
                <tr>
                  <td className="table-cell">Utilisateur 2</td>
                  <td className="table-cell">
                    <span className="badge badge-warning">En attente</span>
                  </td>
                  <td className="table-cell-muted">2024-01-14</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-adaptive-primary">Instructions</h3>
        </div>
        <div className="space-y-2">
          <p className="text-adaptive-secondary">
            • Cliquez sur l'icône croissant/lune dans la sidebar pour changer de thème
          </p>
          <p className="text-adaptive-secondary">
            • Toutes les couleurs de texte s'adaptent automatiquement
          </p>
          <p className="text-adaptive-secondary">
            • Les classes <code className="bg-secondary-100 dark:bg-secondary-700 px-1 rounded text-sm">text-adaptive-*</code> sont utilisées
          </p>
          <p className="text-adaptive-muted">
            • Votre préférence de thème est sauvegardée dans le navigateur
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
