import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  Gavel,
  Settings,
  LogOut,
  Bell,
  Search,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Charger le thème depuis localStorage ou détecter la préférence système
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Role mapping (backend role codes -> Arabic display)
  const roleDisplayMap = {
    admin: 'مدير النظام',
    teacher: 'أستاذ',
    parent: 'ولي',
    student: 'تلميذ',
  };

  // Navigation items
  const navigationItems = [
    {
      name: 'لوحة التحكم',
      path: '/dashboard',
      icon: Home,
      roles: ['admin', 'teacher', 'parent', 'student'],
    },
    {
      name: 'التلاميذ',
      path: '/students',
      icon: Users,
      roles: ['admin', 'teacher'],
    },
    {
      name: 'الأساتذة',
      path: '/teachers',
      icon: UserCheck,
      roles: ['admin'],
    },
    {
      name: 'الغيابات',
      path: '/absences',
      icon: Calendar,
      roles: ['admin', 'teacher'],
    },
    {
      name: 'الحوادث',
      path: '/incidents',
      icon: AlertTriangle,
      roles: ['admin', 'teacher'],
    },
    {
      name: 'مجالس التأديب',
      path: '/discipline',
      icon: Gavel,
      roles: ['admin'],
    },
    {
      name: 'الإعدادات',
      path: '/settings',
      icon: Settings,
      roles: ['admin'],
    },
    {
      name: 'عرض الألوان',
      path: '/theme-demo',
      icon: Sun,
      roles: ['admin', 'teacher'],
    },
  ];

  // Dériver le code et l'affichage du rôle
  const roleCode = user?.role && typeof user.role === 'object' ? user.role.name : user?.role;
  const roleName = roleDisplayMap[roleCode] || roleCode || '';

  // Filtrer les éléments de navigation selon le rôle
  const filteredNavigationItems = navigationItems.filter(item =>
    item.roles.includes(roleCode)
  );

  // Appliquer le thème au chargement de la page
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    
    // Appliquer la classe dark au document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: sidebarOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sidebar z-50"
      >
        {/* Header du sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">نظام الإدارة</h1>
              <p className="text-sm text-secondary-600">ثانوية الإخوة مسعودي</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-secondary-100"
          >
            <X className="w-5 h-5 text-secondary-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-secondary-700 hover:bg-secondary-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer du sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-700">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">{user?.username}</p>
                <p className="text-xs text-secondary-600">{roleName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-secondary-600" />
              ) : (
                <Moon className="w-5 h-5 text-secondary-600" />
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 space-x-reverse text-danger-600 hover:text-danger-700 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className={`main-content ${sidebarOpen ? 'main-content-full' : ''}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-secondary-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-secondary-100"
              >
                <Menu className="w-6 h-6 text-secondary-600" />
              </button>
              
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-secondary-900">
                  {filteredNavigationItems.find(item => item.path === location.pathname)?.name || 'لوحة التحكم'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Barre de recherche */}
              <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="البحث..."
                    className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-secondary-100" title="Notifications">
                <Bell className="w-5 h-5 text-secondary-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full"></span>
              </button>

              {/* Logout direct depuis l'en-tête */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-secondary-100 text-danger-600 hover:text-danger-700"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Profil utilisateur */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-secondary-900">{user?.username}</p>
                  <p className="text-xs text-secondary-600">{roleName}</p>
                </div>
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}
    </div>
  );
};

export default Layout;
