import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

export default function CourseDetail() {
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
    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }
    fetchCourseDetails();
  }, [id, token, role, navigate]);

  // 🔹 Fetch course, PDFs, quizzes
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      const courseRes = await fetch(`http://127.0.0.1:8000/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!courseRes.ok) throw new Error("Cours introuvable");
      const courseData = await courseRes.json();
      setCourse(courseData);

      // PDFs
      const pdfsRes = await fetch(`http://127.0.0.1:8000/pdfs/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pdfsRes.ok) {
        const pdfsData = await pdfsRes.json();
        setPdfs(pdfsData);
      }

      // Quizzes
      const quizzesRes = await fetch(`http://127.0.0.1:8000/quizzes/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setQuizzes(quizzesData);
      }

    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete PDF
  const handleDeletePdf = async (pdfId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce PDF ?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/pdfs/${pdfId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setPdfs(pdfs.filter(pdf => pdf.id !== pdfId));
      alert("✅ PDF supprimé avec succès");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // 🔹 Delete Quiz
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/quizzes/${quizId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      alert("✅ Quiz supprimé avec succès");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // 🔹 Open PDF securely
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

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminNavbar />
          <main className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Chargement du cours...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 🔹 Error state
  if (error || !course) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminNavbar />
          <main className="p-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || "Cours introuvable"}
            </div>
            <button
              onClick={() => navigate("/admin/courses")}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Retour aux cours
            </button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <main className="p-8">
          {/* Course Info */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/admin/courses")}
              className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
            >
              <span>←</span> Retour aux cours
            </button>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📚 {course.title}
              </h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>👨‍🏫 Professeur: {course.teacher?.username || "Non assigné"}</span>
                <span>📅 Créé le: {new Date(course.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 font-semibold transition ${activeTab === "info"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📋 Informations
            </button>
            <button
              onClick={() => setActiveTab("pdfs")}
              className={`px-6 py-3 font-semibold transition ${activeTab === "pdfs"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📄 PDFs ({pdfs.length})
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`px-6 py-3 font-semibold transition ${activeTab === "quizzes"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ❓ Quiz ({quizzes.length})
            </button>
          </div>

          {/* Tab Content */}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Documents PDF</h2>
                <button
                  onClick={() => navigate(`/admin/courses/${id}/add-pdf`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  ➕ Ajouter un PDF
                </button>
              </div>

              {pdfs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📄</div>
                  <p>Aucun PDF pour ce cours</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pdfs.map((pdf) => (
                    <div key={pdf.id} className="border rounded-lg p-4 hover:bg-gray-50 transition flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">📄</div>
                        <div>
                          <h3
                            className="font-semibold text-blue-600 hover:underline cursor-pointer"
                            onClick={() => openPdf(pdf.id)}
                          >
                            {pdf.title}
                          </h3>
                          <p className="text-sm text-gray-500">{pdf.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeletePdf(pdf.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Quiz</h2>
                <button
                  onClick={() => navigate(`/admin/courses/${id}/add-quiz`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  ➕ Ajouter un Quiz
                </button>
              </div>

              {quizzes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">❓</div>
                  <p>Aucun quiz pour ce cours</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded-lg p-4 hover:bg-gray-50 transition flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">❓</div>
                        <div>
                          <h3 className="font-semibold cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}>{quiz.title}</h3>
                          <p className="text-sm text-gray-500">{quiz.questions?.length || 0} questions</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

