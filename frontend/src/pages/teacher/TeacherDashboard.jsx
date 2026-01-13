import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// Sidebar Component
const TeacherSidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", path: "/teacher", icon: "📊" },
    { name: "Mes Étudiants", path: "/teacher/students", icon: "👨‍🎓" },
    { name: "Mes Cours", path: "/teacher/courses", icon: "📚" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">👨‍🏫 Teacher Panel</h2>
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-3 rounded hover:bg-gray-700 transition flex items-center gap-3 ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

// Navbar Component
const TeacherNavbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Professeur";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Bienvenue, {username}</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Déconnexion
      </button>
    </div>
  );
};

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Sidebar intégré
  const TeacherSidebar = () => {
    const menuItems = [
      { name: "Dashboard", path: "/teacher", icon: "📊" },
      { name: "Mes Étudiants", path: "/dashboard/students", icon: "👨‍🎓" },
      { name: "Mes Cours", path: "/teacher/courses", icon: "📚" },
    ];

    return (
      <div className="w-64 bg-gray-800 text-white flex flex-col min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-6">👨‍🏫 Teacher Panel</h2>
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 rounded hover:bg-gray-700 transition flex items-center gap-3 ${
                location.pathname === item.path ? "bg-gray-700" : ""
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  };

  // Navbar intégré
  const TeacherNavbar = () => {
    const username = localStorage.getItem("username") || "Professeur";

    const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
    };

    return (
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Bienvenue, {username}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Déconnexion
        </button>
      </div>
    );
  };

  useEffect(() => {
    console.log("🔍 Vérification du rôle:", role);
    console.log("🔑 Token présent:", !!token);

    if (!token) {
      console.error("❌ Pas de token trouvé");
      navigate("/login");
      return;
    }

    if (role !== "teacher") {
      console.error("❌ Rôle incorrect:", role);
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        console.log("📡 Récupération des cours...");
        const resCourses = await fetch("http://127.0.0.1:8000/courses/teacher", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        console.log("📊 Status courses:", resCourses.status);

        if (!resCourses.ok) {
          const errorText = await resCourses.text();
          console.error("❌ Erreur courses:", errorText);
          throw new Error(`Erreur ${resCourses.status}: ${errorText}`);
        }

        const dataCourses = await resCourses.json();
        console.log("✅ Courses récupérés:", dataCourses);
        setCourses(dataCourses);

        console.log("📡 Récupération des étudiants...");
        const resStudents = await fetch("http://127.0.0.1:8000/users/", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        console.log("📊 Status students:", resStudents.status);

        if (!resStudents.ok) {
          const errorText = await resStudents.text();
          console.error("❌ Erreur students:", errorText);
          throw new Error(`Erreur ${resStudents.status}: ${errorText}`);
        }

        const dataStudents = await resStudents.json();
        console.log("✅ Students récupérés:", dataStudents);
        
        const filteredStudents = dataStudents.filter(u => u.role === "student");
        console.log("🎓 Students filtrés:", filteredStudents);
        setStudents(filteredStudents);

      } catch (err) {
        console.error("💥 Erreur complète:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, role, navigate]);

  // Changer le niveau d'un étudiant
  const handleChangeLevel = async (userId, newLevel) => {
    try {
      console.log(`🔄 Changement de niveau: user ${userId} -> ${newLevel}`);
      
      const res = await fetch(`http://127.0.0.1:8000/users/${userId}/level?level=${newLevel}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Erreur changement niveau:", errorText);
        throw new Error(`Impossible de mettre à jour le niveau: ${errorText}`);
      }

      const data = await res.json();
      console.log("✅ Niveau mis à jour:", data);
      alert(data.message || "Niveau mis à jour avec succès");
      
      setStudents(prev => prev.map(s => 
        s.id === userId ? { ...s, level: newLevel } : s
      ));
    } catch (err) {
      console.error("💥 Erreur:", err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Réessayer
          </button>
          <button
            onClick={() => navigate("/login")}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Retour au login
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <div 
      className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${color} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`text-4xl ${color.replace("border-", "text-")}`}>{icon}</div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col">
        <TeacherNavbar />
        <main className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard Professeur</h1>
          <p className="text-gray-600 mb-8">Voici un aperçu de vos cours et étudiants.</p>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard 
              title="Mes Cours" 
              value={courses.length} 
              icon="📚" 
              color="border-purple-500" 
              onClick={() => navigate("/teacher/courses")}
            />
            <StatCard 
              title="Mes Étudiants" 
              value={students.length} 
              icon="👨‍🎓" 
              color="border-blue-500" 
              onClick={() => navigate("/teacher/students")}
            />
          </div>

          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Étudiants</h2>
              <button
                onClick={() => navigate("/teacher/students")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Voir tous →
              </button>
            </div>
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun étudiant trouvé</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-auto w-full border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border">ID</th>
                      <th className="p-2 border">Nom</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 5).map(student => (
                      <tr key={student.id} className="text-center hover:bg-gray-50">
                        <td className="p-2 border">{student.id}</td>
                        <td className="p-2 border">{student.username}</td>
                        <td className="p-2 border">{student.email}</td>
                        <td className="p-2 border">
                          <select
                            value={student.level}
                            onChange={e => handleChangeLevel(student.id, e.target.value)}
                            className="border px-2 py-1 rounded hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length > 5 && (
                  <p className="text-center text-gray-500 mt-4 text-sm">
                    Et {students.length - 5} autres étudiants...
                  </p>
                )}
              </div>
            )}
          </div>

          
        </main>
      </div>
    </div>
  );
}