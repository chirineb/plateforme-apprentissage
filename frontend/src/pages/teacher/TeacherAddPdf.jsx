import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

/* =======================
   Page Add PDF
======================= */
export default function TeacherAddPdf() {
  const { id: courseId } = useParams(); // id du cours
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  console.log("Token envoyé :", token);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ Vérifier que le token existe
    if (!token) {
      setError("Vous devez être connecté en tant que professeur pour ajouter un PDF");
      return;
    }

    if (!title || !file) {
      setError("Veuillez renseigner le titre et choisir un fichier PDF");
      return;
    }

    const formData = new FormData();
    formData.append("course_id", courseId); // id du cours
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      setLoading(true);

      console.log("Token envoyé:", token); // Pour debug

      const res = await fetch("http://127.0.0.1:8000/pdfs/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erreur lors de l'ajout du PDF");
      }

      setSuccess("✅ PDF ajouté avec succès !");
      setTimeout(() => {
        navigate(`/teacher/courses/${courseId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
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
          <button
            onClick={() => navigate(`/teacher/courses/${courseId}`)}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
          >
            ← Retour au cours
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">➕ Ajouter un PDF</h1>

            {error && <p className="text-red-600 mb-4">{error}</p>}
            {success && <p className="text-green-600 mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Fichier PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                disabled={loading}
              >
                {loading ? "Ajout en cours..." : "Ajouter PDF"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
