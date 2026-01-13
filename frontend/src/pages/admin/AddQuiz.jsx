import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

export default function AddQuiz() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (questionIndex) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== questionIndex));
    }
  };

  const updateQuestion = (questionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].question = value;
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setQuestions(newQuestions);
  };

  const toggleCorrectOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.forEach((opt, i) => {
      opt.is_correct = i === optionIndex;
    });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Le titre du quiz est obligatoire");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`La question ${i + 1} est vide`);
        return;
      }

      const hasCorrectAnswer = q.options.some((opt) => opt.is_correct);
      if (!hasCorrectAnswer) {
        setError(`La question ${i + 1} doit avoir une réponse correcte`);
        return;
      }

      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setError(`L'option ${j + 1} de la question ${i + 1} est vide`);
          return;
        }
      }
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        course_id: parseInt(id),
        questions: questions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((opt) => ({
            text: opt.text.trim(),
            is_correct: opt.is_correct,
          })),
        })),
      };

      console.log("📤 Envoi du quiz:", payload);

      const res = await fetch("http://127.0.0.1:8000/quizzes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Statut:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erreur lors de la création du quiz");
      }

      const result = await res.json();
      console.log("✅ Quiz créé:", result);

      setSuccess("✅ Quiz créé avec succès !");

      setTimeout(() => {
        navigate(`/admin/courses/${id}`);
      }, 1500);
    } catch (err) {
      console.error("💥 Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <button
                onClick={() => navigate(`/admin/courses/${id}`)}
                className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
              >
                <span>←</span> Retour au cours
              </button>
              <h1 className="text-4xl font-bold text-gray-900">❓ Créer un Quiz</h1>
              <p className="text-gray-600 mt-2">
                Ajoutez des questions à choix multiples pour évaluer les connaissances
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">❌</span>
                  <div>
                    <h3 className="font-semibold text-red-800">Erreur</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-800">Succès</h3>
                    <p className="text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre du Quiz <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Quiz Chapitre 1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Question {qIndex + 1}
                    </h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        ✕ Supprimer
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, e.target.value)}
                      placeholder="Posez votre question ici..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Options <span className="text-red-500">*</span>
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={option.is_correct}
                          onChange={() => toggleCorrectOption(qIndex, oIndex)}
                          className="w-5 h-5 text-blue-600"
                          disabled={loading}
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={loading}
                        />
                        <span className="text-sm text-gray-500 w-20">
                          {option.is_correct ? "✓ Correcte" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestion}
                disabled={loading}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-50"
              >
                ➕ Ajouter une question
              </button>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "⏳ Création en cours..." : "✅ Créer le Quiz"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/courses/${id}`)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
