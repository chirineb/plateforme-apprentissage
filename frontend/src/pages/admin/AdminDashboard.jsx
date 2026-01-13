import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/AdminNavbar";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (role !== "admin") {
          setError("Accès non autorisé");
          setTimeout(() => navigate("/dashboard"), 2000);
          return;
        }

        if (!token) {
          setError("Token manquant");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/admin/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          if (response.status === 401) {
            setError("Session expirée");
            localStorage.clear();
            setTimeout(() => navigate("/login"), 2000);
          } else {
            setError(errorData.detail || "Erreur lors du chargement");
          }
          return;
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Erreur fetch:", err);
        setError("Impossible de contacter le serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur</h2>
          </div>
          <p className="text-gray-700 mb-6 text-center">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  const totalUsers = stats.total_students + stats.total_teachers;
  const studentPercentage = totalUsers > 0 ? Math.round((stats.total_students / totalUsers) * 100) : 0;
  const avgEnrollmentsPerCourse = stats.total_courses > 0 ? (stats.total_enrollments / stats.total_courses).toFixed(1) : 0;
  const pdfsPerCourse = stats.total_courses > 0 ? (stats.total_pdfs / stats.total_courses).toFixed(1) : 0;

  const StatCard = ({ title, value, subtitle, icon, color, onClick, trend }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`text-4xl ${color.replace('border-', 'text-')}`}>{icon}</div>
        {trend && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, onClick, color }) => (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-5 cursor-pointer hover:shadow-xl transition-all duration-300 border-t-4"
      style={{ borderTopColor: color }}
    >
      <div className="flex items-start space-x-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="text-gray-400 text-xl">→</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Tableau de bord Admin
            </h1>
            <p className="text-gray-600">
              Bienvenue ! Voici un aperçu de votre plateforme d'apprentissage.
            </p>
          </div>

          {/* Main Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Étudiants"
              value={stats.total_students}
              subtitle={`${studentPercentage}% des utilisateurs`}
              icon="👨‍🎓"
              color="border-blue-500"
              onClick={() => navigate("/admin/students")}
              trend="+12%"
            />
            <StatCard
              title="Professeurs"
              value={stats.total_teachers}
              subtitle="Enseignants actifs"
              icon="👨‍🏫"
              color="border-green-500"
              onClick={() => navigate("/admin/profs")}
            />
            <StatCard
              title="Cours"
              value={stats.total_courses}
              subtitle={`${avgEnrollmentsPerCourse} inscr./cours moy.`}
              icon="📚"
              color="border-purple-500"
              onClick={() => navigate("/admin/courses")}
              trend="+5"
            />
            <StatCard
              title="Inscriptions"
              value={stats.total_enrollments}
              subtitle="Total des inscriptions"
              icon="✅"
              color="border-orange-500"
              onClick={() => navigate("/admin/enrollments")}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">📄</div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  Documents
                </div>
              </div>
              <h3 className="text-lg font-medium mb-1 opacity-90">Fichiers PDF</h3>
              <p className="text-4xl font-bold mb-2">{stats.total_pdfs}</p>
              <p className="text-sm opacity-80">{pdfsPerCourse} PDF par cours en moyenne</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">👥</div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  Communauté
                </div>
              </div>
              <h3 className="text-lg font-medium mb-1 opacity-90">Total Utilisateurs</h3>
              <p className="text-4xl font-bold mb-2">{stats.total_users}</p>
              <p className="text-sm opacity-80">Membres de la plateforme</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">📊</div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  Activité
                </div>
              </div>
              <h3 className="text-lg font-medium mb-1 opacity-90">Taux d'engagement</h3>
              <p className="text-4xl font-bold mb-2">
                {stats.total_courses > 0 ? Math.round((stats.total_enrollments / (stats.total_courses * stats.total_students)) * 100) : 0}%
              </p>
              <p className="text-sm opacity-80">Inscriptions / Cours disponibles</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickActionCard
                title="Gérer les utilisateurs"
                description="Voir, modifier ou supprimer des utilisateurs"
                icon="👥"
                color="#3B82F6"
                onClick={() => navigate("/admin/users")}
              />
              <QuickActionCard
                title="Gérer les cours"
                description="Ajouter, modifier ou supprimer des cours"
                icon="📚"
                color="#8B5CF6"
                onClick={() => navigate("/admin/courses")}
              />
              <QuickActionCard
                title="Gérer les PDFs"
                description="Organiser les ressources pédagogiques"
                icon="📄"
                color="#10B981"
                onClick={() => navigate("/admin/pdfs")}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Statistiques en un coup d'œil</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ratio Étudiants/Profs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_teachers > 0 ? Math.round(stats.total_students / stats.total_teachers) : 0}:1
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Cours par Prof</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.total_teachers > 0 ? (stats.total_courses / stats.total_teachers).toFixed(1) : 0}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Inscr. par Étudiant</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.total_students > 0 ? (stats.total_enrollments / stats.total_students).toFixed(1) : 0}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">PDFs par Cours</p>
                <p className="text-2xl font-bold text-orange-600">{pdfsPerCourse}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}