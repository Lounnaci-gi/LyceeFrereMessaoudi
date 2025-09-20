const mongoose = require('mongoose');

// Schéma pour les rôles
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['admin', 'teacher', 'parent', 'student'],
    unique: true
  },
  permissions: [{
    type: String,
    required: true
  }],
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les spécialités
const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les classes
const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    enum: ['1ère année', '2ème année', '3ème année']
  },
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty'
  },
  academicYear: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les parents (ancien modèle pour compatibilité)
const parentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  relationship: {
    type: String,
    enum: ['father', 'mother', 'guardian'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Nouveau schéma pour les informations parents (père + mère ensemble)
const parentInfoSchema = new mongoose.Schema({
  father: {
    firstName: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    profession: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      default: ''
    }
  },
  mother: {
    firstName: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    profession: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      default: ''
    }
  },
  familySituation: {
    type: String,
    enum: ['married', 'divorced', 'father_deceased', 'mother_deceased', 'both_deceased'],
    required: false,
    default: ''
  },
  financialSituation: {
    type: String,
    enum: ['stable', 'precarious'],
    required: false,
    default: ''
  },
  childrenCount: {
    boys: {
      type: Number,
      required: false,
      default: 0
    },
    girls: {
      type: Number,
      required: false,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les élèves
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  photo: String,
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  phone: String,
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  parents: [{
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true
    },
    relationship: {
      type: String,
      enum: ['father', 'mother', 'guardian'],
      required: true
    }
  }],
  // Informations familiales
  familySituation: {
    type: String,
    enum: ['married', 'divorced', 'father_deceased', 'mother_deceased', 'both_deceased'],
    required: false,
    default: null
  },
  financialSituation: {
    type: String,
    enum: ['stable', 'precarious'],
    required: false,
    default: null
  },
  childrenCount: {
    boys: {
      type: Number,
      required: false,
      default: 0
    },
    girls: {
      type: Number,
      required: false,
      default: 0
    }
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  schoolingType: {
    type: String,
    enum: ['externe', 'demi-pensionnaire'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les enseignants
const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: String,
  photo: String,
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les matières
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  hoursPerWeek: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les absences
const absenceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    enum: ['illness', 'family', 'other'],
    required: true
  },
  description: String,
  isJustified: {
    type: Boolean,
    default: false
  },
  justifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  justifiedAt: Date,
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les incidents
const incidentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['discipline', 'academic', 'behavior', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  witnesses: [String],
  actions: [{
    action: String,
    date: {
      type: Date,
      default: Date.now
    },
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les conseils de discipline
const disciplineCouncilSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['president', 'member', 'secretary'],
      required: true
    }
  }],
  cases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DisciplinaryCase'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma pour les cas disciplinaires
const disciplinaryCaseSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  council: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DisciplineCouncil'
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  decision: {
    type: String,
    enum: ['warning', 'suspension', 'expulsion', 'other'],
    required: true
  },
  decisionDetails: String,
  duration: {
    type: Number,
    default: 0
  },
  durationUnit: {
    type: String,
    enum: ['days', 'weeks', 'months'],
    default: 'days'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'decided', 'appealed', 'final'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Création des modèles
const Role = mongoose.model('Role', roleSchema);
const User = mongoose.model('User', userSchema);
const Specialty = mongoose.model('Specialty', specialtySchema);
const Class = mongoose.model('Class', classSchema);
const Parent = mongoose.model('Parent', parentSchema);
const ParentInfo = mongoose.model('ParentInfo', parentInfoSchema);
const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Absence = mongoose.model('Absence', absenceSchema);
const Incident = mongoose.model('Incident', incidentSchema);
const DisciplineCouncil = mongoose.model('DisciplineCouncil', disciplineCouncilSchema);
const DisciplinaryCase = mongoose.model('DisciplinaryCase', disciplinaryCaseSchema);

module.exports = {
  Role,
  User,
  Specialty,
  Class,
  Parent,
  ParentInfo,
  Student,
  Teacher,
  Subject,
  Absence,
  Incident,
  DisciplineCouncil,
  DisciplinaryCase
};
