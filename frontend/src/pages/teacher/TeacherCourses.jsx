import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";


/* =======================
   Sidebar Teacher
======================= */
const TeacherSidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", path: "/teacher", icon: "📊" },
    { name: "Mes Étudiants", path: "/teacher/students", icon: "👨‍🎓" },
    { name: "Mes Cours", path: "/teacher/courses", icon: "📚" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">👨‍🏫 Teacher Panel</h2>
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-3 rounded hover:bg-gray-700 ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

/* =======================
   Navbar Teacher
======================= */
const TeacherNavbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Professeur";

  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <h1>Bienvenue, {username}</h1>
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Déconnexion
      </button>
    </div>
  );
};

/* =======================
   Teacher Courses Page
======================= */
export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  /* =======================
     Fetch Teacher Courses
  ======================= */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (role !== "teacher") {
          setError("Accès non autorisé");
          setTimeout(() => navigate("/teacher"), 2000);
          return;
        }

        if (!token) {
          setError("Token manquant");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/courses/teacher",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des cours");
        }

        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        setError(err.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate, role, token]);

  /* =======================
     Search Filter
  ======================= */
  useEffect(() => {
    const filtered = courses.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [search, courses]);

  /* =======================
     Delete Course
  ======================= */
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("⚠️ Voulez-vous vraiment supprimer ce cours ?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      // Mise à jour instantanée
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setFilteredCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  if (loading) return <div className="p-10">Chargement...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col">
        <TeacherNavbar />

        <main className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">📘 Mes cours</h1>
            <button
              onClick={() => navigate("/teacher/courses/add")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              ➕ Ajouter un cours
            </button>
          </div>

          {/* Recherche */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded w-full md:w-1/3"
            />
          </div>

          {/* Tableau des cours */}
          {filteredCourses.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow text-center">
              <p className="text-gray-600">Aucun cours trouvé</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Titre</th>
                    <th className="px-6 py-4 text-left">Description</th>
                    <th className="px-6 py-4 text-left">Date de création</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course, i) => (
                    <tr
                      key={course.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4">#{course.id}</td>
                      <td className="px-6 py-4 font-medium">{course.title}</td>
                      <td className="px-6 py-4">{course.description}</td>
                      <td className="px-6 py-4">
                        {new Date(course.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {/* Le bouton Voir qui ouvre la page de détail */}
                          <button
                            onClick={() =>
                              navigate(`/teacher/courses/${course.id}`)
                            }
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Voir
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
