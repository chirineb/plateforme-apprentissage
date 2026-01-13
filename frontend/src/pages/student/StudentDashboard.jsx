import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../../components/StudentNavbar";
import StudentSidebar from "../../components/StudentSidebar";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "student") {
      navigate("/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        // ✅ Récupérer tous les cours
        const res = await fetch("http://127.0.0.1:8000/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Impossible de récupérer les cours");

        const data = await res.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token, role, navigate]);

  // Filtrage par recherche
  useEffect(() => {
    const filtered = courses.filter((course) =>
      course.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [search, courses]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar />
          <main className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des cours...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar />
          <main className="p-8 text-center text-red-600">
            <p>{error}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentNavbar />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6">📚 Mes Cours</h1>

          {/* Barre de recherche */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun cours trouvé
              </h3>
              <p className="text-gray-500">
                {search
                  ? "Aucun cours ne correspond à votre recherche"
                  : "Aucun cours n’est encore disponible pour vous."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
                >
                  <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <p className="text-sm text-gray-500">
                    Créé le: {new Date(course.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                    >
                      Lire le cours
                    </button>
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                      onClick={() => navigate(`/student/courses/${course.id}/quizzes`)}
                    >
                      Faire le quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
