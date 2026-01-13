import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Quiz non trouvé");
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, token]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
          {quiz.questions.map((q, index) => (
            <div key={index} className="mb-6 p-4 bg-white rounded shadow">
              <p className="font-semibold">Question {index + 1}: {q.question}</p>
              <ul className="list-disc pl-5">
                {q.options.map((opt, i) => (
                  <li key={i} className={opt.is_correct ? "text-green-600 font-bold" : ""}>
                    {opt.text} {opt.is_correct ? "(Correcte)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            ← Retour
          </button>
        </main>
      </div>
    </div>
  );
}
