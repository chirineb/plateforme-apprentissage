import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import StudentNavbar from "../../components/StudentNavbar";
import StudentChatbot from "../../components/StudentChatbot";

export default function StudentCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        if (!token) {
          throw new Error("Utilisateur non authentifié");
        }

        /* ✅ ROUTE ÉTUDIANT */
        const resCourse = await fetch(
          `http://127.0.0.1:8000/courses/student/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resCourse.ok) {
          throw new Error("Impossible de récupérer le cours");
        }

        setCourse(await resCourse.json());

        /* PDFs */
        const resPdfs = await fetch(
          `http://127.0.0.1:8000/pdfs/course/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resPdfs.ok) {
          throw new Error("Impossible de récupérer les PDFs");
        }

        setPdfs(await resPdfs.json());

        /* Quizzes */
        const resQuizzes = await fetch(
          `http://127.0.0.1:8000/quizzes/course/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resQuizzes.ok) {
          throw new Error("Impossible de récupérer les quizzes");
        }

        setQuizzes(await resQuizzes.json());

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id, token]);

  /* 📄 Ouvrir PDF */
  const openPdf = async (pdfId, filename) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/pdfs/${pdfId}/open`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Impossible d'ouvrir le PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ⏳ LOADING */
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar />
          <main className="p-8 text-center">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4 rounded-full"></div>
            <p className="text-gray-600">Chargement du cours...</p>
          </main>
        </div>
      </div>
    );
  }

  /* ❌ ERROR */
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
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

  /* ✅ PAGE */
  return (
  <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
    <StudentSidebar />

    <div className="flex-1 flex flex-col">
      <StudentNavbar />

      <main className="p-8 max-w-6xl mx-auto w-full">
        {/* 🧠 Course Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">📘</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {course.title}
              </h1>
              <p className="text-gray-500">
                {course.description}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              📚 Cours
            </span>
            <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              🎯 Apprentissage
            </span>
          </div>
        </div>

        {/* 📄 PDFs */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            📄 Ressources PDF
          </h2>

          {pdfs.length === 0 ? (
            <p className="text-gray-500 italic">
              Aucun document disponible pour ce cours
            </p>
          ) : (
            <ul className="space-y-4">
              {pdfs.map(pdf => (
                <li
                  key={pdf.id}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition"
                >
                  <span className="font-medium text-gray-700">
                    {pdf.title}
                  </span>
                  <button
                    onClick={() => openPdf(pdf.id, pdf.title + ".pdf")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Ouvrir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 📝 Quiz */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            📝 Quiz
          </h2>

          {quizzes.length === 0 ? (
            <p className="text-gray-500 italic">
              Aucun quiz disponible pour le moment
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {quizzes.map(quiz => (
                <div
                  key={quiz.id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold mb-3">
                    {quiz.title}
                  </h3>
                  <button
                    onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Commencer le quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>

    {/* 🤖 Chatbot flottant */}
    <div className="fixed bottom-6 right-6">
      <StudentChatbot courseId={id} />
    </div>
  </div>
  );
  }
