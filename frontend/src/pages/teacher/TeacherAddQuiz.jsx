import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


/* =======================
   Sidebar Teacher
======================= */
const TeacherSidebar = () => {
  const location = window.location.pathname;
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
          <a
            key={item.path}
            href={item.path}
            className={`p-3 rounded hover:bg-gray-700 ${
              location === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.icon} {item.name}
          </a>
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
export default function TeacherAddQuiz() {
  const { id } = useParams(); // course id
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

  // Ajouter une question
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

  // Supprimer une question
  const removeQuestion = (qIndex) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== qIndex));
    }
  };

  // Modifier le texte d'une question
  const updateQuestion = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].question = value;
    setQuestions(newQuestions);
  };

  // Modifier le texte d'une option
  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = value;
    setQuestions(newQuestions);
  };

  // Choisir l'option correcte
  const toggleCorrectOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.forEach((opt, i) => {
      opt.is_correct = i === oIndex;
    });
    setQuestions(newQuestions);
  };

  // Soumettre le quiz
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

      const res = await fetch("http://127.0.0.1:8000/quizzes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erreur lors de la création du quiz");
      }

      const result = await res.json();
      setSuccess("✅ Quiz créé avec succès !");
      setTimeout(() => navigate(`/teacher/courses/${id}`), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col">
        <TeacherNavbar />
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Créer un Quiz pour ce cours</h1>

            {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Titre du quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded"
                disabled={loading}
              />

              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border rounded space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold">Question {qIndex + 1}</h2>
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-600">
                        Supprimer
                      </button>
                    )}
                  </div>

                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, e.target.value)}
                    placeholder="Écrivez la question"
                    className="w-full p-2 border rounded"
                    rows={3}
                    disabled={loading}
                  />

                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={opt.is_correct}
                          onChange={() => toggleCorrectOption(qIndex, oIndex)}
                          disabled={loading}
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 p-2 border rounded"
                          disabled={loading}
                        />
                        {opt.is_correct && <span className="text-green-600 font-semibold">Correcte</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button type="button" onClick={addQuestion} disabled={loading} className="p-2 border rounded w-full">
                Ajouter une question
              </button>

              <button type="submit" disabled={loading} className="p-3 bg-blue-600 text-white rounded w-full">
                {loading ? "Création en cours..." : "Créer le Quiz"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
