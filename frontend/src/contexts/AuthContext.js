import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.verifyToken();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);
        toast.success('تم تسجيل الدخول بنجاح');
        return { success: true };
      } else {
        toast.error(response.message || 'فشل في تسجيل الدخول');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('خطأ في الاتصال بالخادم');
      return { success: false, message: 'خطأ في الاتصال بالخادم' };
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('تم تسجيل الخروج بنجاح');
    }
  };

  // Fonction de changement de mot de passe
  const changePassword = async (passwords) => {
    try {
      const response = await authService.changePassword(passwords);
      
      if (response.success) {
        toast.success('تم تغيير كلمة المرور بنجاح');
        return { success: true };
      } else {
        toast.error(response.message || 'فشل في تغيير كلمة المرور');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erreur de changement de mot de passe:', error);
      toast.error('خطأ في تغيير كلمة المرور');
      return { success: false, message: 'خطأ في تغيير كلمة المرور' };
    }
  };

  // Vérifier les permissions (accepte tableau ['perm'] ou objet { perm: true })
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    const perms = user.permissions;
    if (Array.isArray(perms)) {
      return perms.includes('*') || perms.includes(permission);
    }
    return perms[permission] === true;
  };

  // Vérifier le rôle (compat objet/string)
  const hasRole = (role) => {
    if (!user) return false;
    const roleName = user.role && typeof user.role === 'object' ? user.role.name : user.role;
    return roleName === role;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    changePassword,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
