const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'رمز الوصول مطلوب' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .populate('role', 'name permissions');

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'المستخدم غير موجود أو غير نشط' 
      });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role_name: user.role?.name,
      permissions: Array.isArray(user.role?.permissions) ? user.role.permissions : [],
    };
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ 
      success: false, 
      message: 'رمز الوصول غير صالح' 
    });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'غير مصرح' 
      });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ 
        success: false, 
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد' 
      });
    }

    next();
  };
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'غير مصرح' 
      });
    }

    const permissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];

    if (!(permissions.includes('*') || permissions.includes(requiredPermission))) {
      return res.status(403).json({ 
        success: false, 
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد' 
      });
    }

    next();
  };
};

module.exports = {
  auth,
  checkRole,
  checkPermission
};
