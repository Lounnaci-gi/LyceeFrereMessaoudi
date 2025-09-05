import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { studentsService } from '../services/studentsService';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await studentsService.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [loading, isAuthenticated]);

  // Données fictives pour les graphiques
  const absenceData = [
    { name: 'يناير', value: 45 },
    { name: 'فبراير', value: 38 },
    { name: 'مارس', value: 52 },
    { name: 'أبريل', value: 41 },
    { name: 'مايو', value: 35 },
    { name: 'يونيو', value: 28 },
  ];

  // Données dynamiques basées sur les vraies statistiques
  const genderData = stats ? [
    { name: 'ذكور', value: stats.genderStats.male, color: '#3b82f6' },
    { name: 'إناث', value: stats.genderStats.female, color: '#ec4899' },
  ] : [
    { name: 'ذكور', value: 0, color: '#3b82f6' },
    { name: 'إناث', value: 0, color: '#ec4899' },
  ];

  const specialtyData = stats ? stats.studentsBySpecialty.map((item, index) => ({
    name: item.specialtyName,
    value: item.count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][index % 6]
  })) : [];

  const statsCards = [
    {
      title: 'إجمالي التلاميذ',
      value: stats ? stats.totalStudents.toString() : '0',
      change: stats ? `+${stats.recentStudents}` : '+0',
      changeType: 'increase',
      icon: Users,
      color: 'primary',
    },
    {
      title: 'الذكور',
      value: stats ? stats.genderStats.male.toString() : '0',
      change: stats ? `${Math.round((stats.genderStats.male / stats.totalStudents) * 100)}%` : '0%',
      changeType: 'increase',
      icon: Users,
      color: 'primary',
    },
    {
      title: 'الإناث',
      value: stats ? stats.genderStats.female.toString() : '0',
      change: stats ? `${Math.round((stats.genderStats.female / stats.totalStudents) * 100)}%` : '0%',
      changeType: 'increase',
      icon: UserCheck,
      color: 'success',
    },
    {
      title: 'التلاميذ النشطون',
      value: stats ? stats.totalStudents.toString() : '0',
      change: '100%',
      changeType: 'increase',
      icon: Activity,
      color: 'success',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'absence',
      student: 'أحمد محمد',
      class: '2AS رياضيات',
      time: 'منذ 5 دقائق',
      description: 'تسجيل غياب غير مبرر',
    },
    {
      id: 2,
      type: 'incident',
      student: 'فاطمة علي',
      class: '1AS علوم طبيعية',
      time: 'منذ 15 دقيقة',
      description: 'تسجيل حادث سلوكي',
    },
    {
      id: 3,
      type: 'student',
      student: 'محمد أحمد',
      class: '3AS آداب',
      time: 'منذ ساعة',
      description: 'إضافة تلميذ جديد',
    },
    {
      id: 4,
      type: 'teacher',
      student: 'أستاذ جديد',
      class: 'مادة الفيزياء',
      time: 'منذ ساعتين',
      description: 'إضافة أستاذ جديد',
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'absence':
        return <Calendar className="w-4 h-4 text-warning-600" />;
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-danger-600" />;
      case 'student':
        return <Users className="w-4 h-4 text-primary-600" />;
      case 'teacher':
        return <UserCheck className="w-4 h-4 text-success-600" />;
      default:
        return <Activity className="w-4 h-4 text-secondary-600" />;
    }
  };

  if (loadingStats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">لوحة التحكم</h1>
          <p className="text-secondary-600">مرحباً بك في نظام إدارة التلاميذ</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Titre de la page */}
      <div>
        <h1 className="text-2xl font-bold text-adaptive-primary">لوحة التحكم</h1>
        <p className="text-adaptive-secondary">مرحباً بك في نظام إدارة التلاميذ</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-adaptive-secondary">{card.title}</p>
                  <p className="text-2xl font-bold text-adaptive-primary">{card.value}</p>
                  <div className="flex items-center mt-2">
                    {card.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4 text-success-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-danger-600" />
                    )}
                    <span
                      className={`text-sm font-medium ml-1 ${
                        card.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-${card.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des absences */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">إحصائيات الغيابات الشهرية</h3>
            <p className="card-subtitle">عدد الغيابات حسب الشهر</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={absenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Graphique de répartition par genre */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="card-title">توزيع التلاميذ حسب الجنس</h3>
            <p className="card-subtitle">النسبة المئوية للذكور والإناث</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Graphique des spécialités */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="card-title">توزيع التلاميذ حسب التخصص</h3>
          <p className="card-subtitle">عدد التلاميذ في كل تخصص</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={specialtyData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Activités récentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="card-title">الأنشطة الأخيرة</h3>
          <p className="card-subtitle">آخر التحديثات في النظام</p>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 space-x-reverse p-3 rounded-lg hover:bg-secondary-50">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900">
                  {activity.student}
                </p>
                <p className="text-sm text-secondary-600">
                  {activity.description} - {activity.class}
                </p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-secondary-500">
                <Clock className="w-4 h-4" />
                <span>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
