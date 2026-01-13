import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
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

        const response = await fetch("http://127.0.0.1:8000/admin/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Erreur lors du chargement des cours");

        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Impossible de contacter le serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate, role, token]);

  // Recherche
  useEffect(() => {
    const filtered = courses.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [search, courses]);

  // Supprimer un cours
  const handleDelete = async (courseId) => {
    if (!window.confirm("⚠️ Voulez-vous vraiment supprimer ce cours ?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur lors de la suppression");
      }

      // Retirer le cours du tableau
      setCourses(prev => prev.filter(c => c.id !== courseId));
      alert("✅ Cours supprimé avec succès !");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  if (loading) return <div className="p-10">Chargement des cours...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">📚 Gestion des Cours</h1>
            <button
              onClick={() => navigate("/admin/courses/add")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
            >
              ➕ Ajouter un cours
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded w-full md:w-1/3"
            />
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun cours trouvé
              </h3>
              <p className="text-gray-500 mb-4">
                Les cours seront affichés ici une fois créés.
              </p>
              <button
                onClick={() => navigate("/admin/courses/add")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Créer mon premier cours
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Titre</th>
                      <th className="px-6 py-4 text-left">Description</th>
                      <th className="px-6 py-4 text-left">Professeur</th>
                      <th className="px-6 py-4 text-left">Date de création</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course, i) => (
                      <tr
                        key={course.id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                      >
                        <td className="px-6 py-4">#{course.id}</td>
                        <td className="px-6 py-4 font-medium">{course.title}</td>
                        <td className="px-6 py-4">{course.description}</td>
                        <td className="px-6 py-4">👨‍🏫 {course.teacher_name}</td>
                        <td className="px-6 py-4">
                          {new Date(course.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => navigate(`/admin/courses/${course.id}`)}
                            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                          >
                            Voir le cours
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                          >
                            Supprimer
                          </button>
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
