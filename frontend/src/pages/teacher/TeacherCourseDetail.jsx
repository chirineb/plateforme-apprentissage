import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

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

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "teacher") {
      navigate("/login");
      return;
    }
    fetchCourseDetails();
  }, [id, token, role, navigate]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);

      // Détails du cours
      const resCourse = await fetch(`http://127.0.0.1:8000/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resCourse.ok) throw new Error("Cours introuvable");
      const courseData = await resCourse.json();
      setCourse(courseData);

      // PDFs
      const resPdfs = await fetch(`http://127.0.0.1:8000/pdfs/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resPdfs.ok) {
        const pdfsData = await resPdfs.json();
        setPdfs(pdfsData);
      }

      // Quizzes
      const resQuizzes = await fetch(`http://127.0.0.1:8000/quizzes/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resQuizzes.ok) {
        const quizzesData = await resQuizzes.json();
        setQuizzes(quizzesData);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = async (pdfId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/pdfs/${pdfId}/open`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Impossible d’ouvrir le PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      alert(err.message);
    }
  };

  // Navigation vers ajout PDF / Quiz
  const handleAddPdf = () => navigate(`/teacher/courses/${id}/pdfs/add`);
  const handleAddQuiz = () => navigate(`/teacher/courses/${id}/quizzes/add`);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col">
          <TeacherNavbar />
          <main className="p-8 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Chargement du cours...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen bg-red-50">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col">
          <TeacherNavbar />
          <main className="p-8 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-lg text-center">
              <h2 className="text-2xl text-red-600 font-bold mb-4">Erreur</h2>
              <p className="mb-4">{error || "Cours introuvable"}</p>
              <button
                onClick={() => navigate("/teacher/courses")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                ← Retour aux cours
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col">
        <TeacherNavbar />
        <main className="p-8">
          <button
            onClick={() => navigate("/teacher/courses")}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
          >
            ← Retour aux cours
          </button>

          {/* Header du cours */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-2">📚 {course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>👨‍🏫 Professeur: {course.teacher?.username || "Non assigné"}</span>
              <span>📅 Créé le: {new Date(course.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "info"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📋 Informations
            </button>
            <button
              onClick={() => setActiveTab("pdfs")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "pdfs"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📄 PDFs ({pdfs.length})
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "quizzes"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ❓ Quiz ({quizzes.length})
            </button>
          </div>

          {/* Contenu des tabs */}
          {activeTab === "info" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Détails du cours</h2>
              <div className="space-y-3">
                <div><span className="font-semibold">ID:</span> #{course.id}</div>
                <div><span className="font-semibold">Titre:</span> {course.title}</div>
                <div><span className="font-semibold">Description:</span> {course.description}</div>
                <div><span className="font-semibold">Date de création:</span>{" "}
                  {new Date(course.created_at).toLocaleString("fr-FR")}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pdfs" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddPdf}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  ➕ Ajouter PDF
                </button>
              </div>
              {pdfs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun PDF pour ce cours</p>
              ) : (
                <ul className="space-y-3">
                  {pdfs.map((pdf) => (
                    <li
                      key={pdf.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                      onClick={() => openPdf(pdf.id)}
                    >
                      <h3 className="font-semibold text-blue-600">{pdf.title}</h3>
                      <p className="text-sm text-gray-500">{pdf.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddQuiz}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  ➕ Ajouter Quiz
                </button>
              </div>
              {quizzes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun quiz pour ce cours</p>
              ) : (
                <ul className="space-y-3">
                  {quizzes.map((quiz) => (
                    <li
                      key={quiz.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                      onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)}
                    >
                      <h3 className="font-semibold text-blue-600">{quiz.title}</h3>
                      <p className="text-sm text-gray-500">{quiz.questions?.length || 0} questions</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
