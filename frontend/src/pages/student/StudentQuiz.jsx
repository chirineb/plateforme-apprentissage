import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentNavbar from "../../components/StudentNavbar";
import StudentSidebar from "../../components/StudentSidebar";

export default function StudentQuiz() {
  const { id } = useParams(); // ID du quiz
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userAnswers, setUserAnswers] = useState([]); // State pour les réponses
  const [submitting, setSubmitting] = useState(false); // State pour la soumission
  const [result, setResult] = useState(null); // Résultat après soumission

  // 🔹 Récupération du quiz
  useEffect(() => {
    if (!token || role !== "student") {
      navigate("/login");
      return;
    }

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://127.0.0.1:8000/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Impossible de récupérer le quiz");

        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, token, role, navigate]);

  // 🔹 Sélectionner une option
  const handleSelectOption = (questionId, optionId) => {
    setUserAnswers(prev => {
      const existing = prev.find(a => a.question_id === questionId);
      if (existing) {
        return prev.map(a =>
          a.question_id === questionId ? { ...a, option_id: optionId } : a
        );
      } else {
        return [...prev, { question_id: questionId, option_id: optionId }];
      }
    });
  };

  // 🔹 Soumettre le quiz
  const submitQuiz = async () => {
    if (!quiz) return;

    // Vérifier que toutes les questions sont répondues
    if (userAnswers.length !== quiz.questions.length) {
      alert("Veuillez répondre à toutes les questions avant de soumettre");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { answers: userAnswers };
      console.log("Payload envoyé:", payload);

      const res = await fetch(`http://127.0.0.1:8000/quizzes/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Réponse backend:", data);

      if (!res.ok) throw new Error(data.detail || "Erreur lors de la soumission du quiz");

      setResult(data);
    } catch (err) {
      console.error("Erreur submitQuiz:", err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Loading
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar />
          <main className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du quiz...</p>
          </main>
        </div>
      </div>
    );
  }

  // 🔹 Error
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

  // 🔹 Quiz JSX
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentNavbar />
        <main className="p-8 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-6">📝 {quiz.title}</h1>

          {result ? (
            <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded space-y-2">
              <h2 className="text-xl font-semibold">Résultat</h2>
              <p>Score : {result.score}/{result.total}</p>
              <p>Pourcentage : {result.percentage}%</p>
              <p>{result.passed ? "✅ Quiz réussi !" : "❌ Échec"}</p>
              <button
                onClick={() => navigate("/student/courses")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retour aux cours
              </button>
            </div>
          ) : (
            <>
              {quiz.questions.map(q => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                >
                  <h2 className="text-xl font-semibold mb-4">{q.question}</h2>
                  <div className="flex flex-col gap-3">
                    {q.options.map(o => (
                      <label
                        key={o.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={o.id}
                          checked={
                            userAnswers.find(a => a.question_id === q.id)?.option_id === o.id
                          }
                          onChange={() => handleSelectOption(q.id, o.id)}
                          className="w-4 h-4"
                        />
                        <span>{o.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={submitQuiz}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition w-full"
                disabled={submitting}
              >
                {submitting ? "Soumission..." : "Soumettre le quiz"}
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
