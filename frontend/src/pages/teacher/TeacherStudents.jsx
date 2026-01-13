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

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "teacher") {
      navigate("/login");
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Erreur lors du chargement des étudiants");

        const data = await response.json();
        const studentList = data.filter((u) => u.role === "student");
        setStudents(studentList);
        setFilteredStudents(studentList);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, role, navigate]);

  // Filter students based on search and level
  useEffect(() => {
    let filtered = students;

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.username.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((s) => s.level === levelFilter);
    }

    setFilteredStudents(filtered);
  }, [search, levelFilter, students]);

  const handleChangeLevel = async (userId, newLevel) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/users/${userId}/level?level=${newLevel}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Impossible de mettre à jour le niveau: ${errorText}`);
      }

      const data = await res.json();
      alert(data.message || "Niveau mis à jour avec succès");

      setStudents((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, level: newLevel } : s))
      );
    } catch (err) {
      console.error("Erreur:", err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col">
          <TeacherNavbar />
          <main className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col">
          <TeacherNavbar />
          <main className="p-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const levelStats = {
    beginner: students.filter((s) => s.level === "beginner").length,
    intermediate: students.filter((s) => s.level === "intermediate").length,
    advanced: students.filter((s) => s.level === "advanced").length,
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col">
        <TeacherNavbar />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍🎓 Mes Étudiants</h1>
            <p className="text-gray-600">Gérez et suivez vos étudiants</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Étudiants</h3>
              <p className="text-3xl font-bold text-gray-800">{students.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-gray-600 text-sm font-medium mb-1">Débutants</h3>
              <p className="text-3xl font-bold text-gray-800">{levelStats.beginner}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
              <h3 className="text-gray-600 text-sm font-medium mb-1">Intermédiaires</h3>
              <p className="text-3xl font-bold text-gray-800">{levelStats.intermediate}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-gray-600 text-sm font-medium mb-1">Avancés</h3>
              <p className="text-3xl font-bold text-gray-800">{levelStats.advanced}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  placeholder="Nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filtrer par niveau
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun étudiant trouvé
              </h3>
              <p className="text-gray-500">
                {search || levelFilter !== "all"
                  ? "Essayez de modifier vos filtres"
                  : "Aucun étudiant n'est actuellement inscrit"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Nom d'utilisateur</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Niveau</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, i) => (
                      <tr
                        key={student.id}
                        className={`${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition`}
                      >
                        <td className="px-6 py-4">#{student.id}</td>
                        <td className="px-6 py-4 font-medium">{student.username}</td>
                        <td className="px-6 py-4">{student.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              student.level === "advanced"
                                ? "bg-purple-100 text-purple-800"
                                : student.level === "intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {student.level === "beginner"
                              ? "Débutant"
                              : student.level === "intermediate"
                              ? "Intermédiaire"
                              : "Avancé"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <select
                            value={student.level}
                            onChange={(e) => handleChangeLevel(student.id, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="beginner">Débutant</option>
                            <option value="intermediate">Intermédiaire</option>
                            <option value="advanced">Avancé</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}