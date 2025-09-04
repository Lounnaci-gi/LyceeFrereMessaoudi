# نظام إدارة التلاميذ - ثانوية الإخوة مسعودي

## 🚀 دليل التثبيت والتشغيل السريع

### المتطلبات الأساسية
- Node.js 16+ 
- SQL Server 2019+
- npm أو yarn

### 1. إعداد قاعدة البيانات

```bash
# تشغيل SQL Server
# إنشاء قاعدة البيانات
sqlcmd -S localhost -i backend/database_init.sql
```

### 2. إعداد Backend

```bash
cd backend
npm install

# نسخ ملف الإعدادات
cp config.env.example config.env

# تعديل الإعدادات في config.env
DB_SERVER=localhost
DB_DATABASE=lycee_freres_messaoudi
DB_USER=sa
DB_PASSWORD=YourPassword123
JWT_SECRET=your-super-secret-jwt-key

# تشغيل الخادم
npm run dev
```

### 3. إعداد Frontend

```bash
cd frontend
npm install

# تشغيل التطبيق
npm start
```

### 4. الوصول للنظام

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Utilisateur admin**: admin / admin123

## 📁 هيكل المشروع

```
lycee-freres-messaoudi/
├── backend/                 # API Backend (Node.js/Express)
│   ├── config/             # Configuration DB
│   ├── middleware/         # Middleware (auth, upload)
│   ├── routes/            # Routes API
│   ├── uploads/            # Fichiers uploadés
│   ├── server.js          # Serveur principal
│   ├── package.json       # Dépendances backend
│   └── database_init.sql  # Script DB
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Pages de l'app
│   │   ├── contexts/      # Contextes (Auth)
│   │   ├── services/      # Services API
│   │   ├── App.js         # App principal
│   │   └── index.js       # Point d'entrée
│   ├── public/            # Fichiers publics
│   └── package.json       # Dépendances frontend
└── README.md              # Documentation
```

## 🔐 Rôles et Permissions

### مدير النظام (Admin)
- ✅ جميع الوظائف
- ✅ إدارة المستخدمين
- ✅ إعدادات النظام

### مدير المؤسسة (Directeur)
- ✅ إدارة التلاميذ والآباء
- ✅ إدارة الأساتذة
- ✅ إدارة الغيابات والحوادث
- ✅ مجالس التأديب
- ✅ التقارير والإحصائيات

### أستاذ (Enseignant)
- ✅ عرض التلاميذ
- ✅ تسجيل الغيابات والحوادث
- ✅ عرض التقارير الأساسية

### مراقب (Surveillant)
- ✅ عرض التلاميذ
- ✅ تسجيل الغيابات والحوادث
- ✅ عرض مجالس التأديب

## 🛠️ Commandes Utiles

```bash
# Backend
cd backend
npm run dev          # Mode développement
npm start            # Mode production
npm test             # Tests

# Frontend
cd frontend
npm start            # Mode développement
npm run build        # Build production
npm test             # Tests
```

## 🔧 Dépannage

### Problèmes de base de données
```bash
# Vérifier la connexion
sqlcmd -S localhost -d lycee_freres_messaoudi -Q "SELECT 1"
```

### Problèmes Backend
```bash
# Vérifier les logs
tail -f backend/logs/app.log

# Redémarrer le serveur
pm2 restart backend
```

### Problèmes Frontend
```bash
# Nettoyer le cache
npm run build -- --reset-cache

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

للحصول على الدعم التقني:
- البريد الإلكتروني: support@lycee.com
- الهاتف: +213 XXX XXX XXX

---

**تم تطوير هذا النظام بواسطة فريق تطوير ثانوية الإخوة مسعودي**  
**الإصدار: 1.0.0**  
**تاريخ الإصدار: سبتمبر 2024**
