import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { useNavigate } from "react-router-dom";

export default function AddCourse() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Charger la liste des professeurs au démarrage
  useEffect(() => {
    console.log("🔍 Chargement de la page AddCourse");
    
    if (!token || role !== "admin") {
      console.log("❌ Non autorisé, redirection vers login");
      navigate("/login");
      return;
    }

    const fetchTeachers = async () => {
      try {
        console.log("📡 Chargement des professeurs...");
        
        const res = await fetch("http://127.0.0.1:8000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des utilisateurs");
        }
        
        const users = await res.json();
        console.log("👥 Utilisateurs récupérés:", users.length);
        
        const teachersList = users.filter(u => u.role === "teacher");
        console.log("👨‍🏫 Professeurs trouvés:", teachersList.length);
        
        setTeachers(teachersList);
        
        if (teachersList.length === 0) {
          setError("⚠️ Aucun professeur trouvé. Veuillez d'abord créer un utilisateur avec le rôle 'teacher'.");
        }
      } catch (err) {
        console.error("💥 Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [token, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Tentative de création de cours");
    
    setError("");
    setSuccess("");

    // Validation des champs
    if (!title.trim()) {
      setError("❌ Le titre est obligatoire");
      return;
    }
    if (!description.trim()) {
      setError("❌ La description est obligatoire");
      return;
    }
    if (!teacherId) {
      setError("❌ Veuillez sélectionner un professeur");
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        is_published: true,
        teacher_id: parseInt(teacherId)
      };
      
      console.log("📦 Données envoyées:", payload);

      const res = await fetch("http://127.0.0.1:8000/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Statut de la réponse:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Erreur backend:", errorData);
        throw new Error(errorData.detail || "Erreur lors de la création du cours");
      }

      const newCourse = await res.json();
      console.log("✅ Cours créé avec succès:", newCourse);
      
      setSuccess("✅ Cours créé avec succès ! Redirection...");
      
      // Réinitialiser le formulaire
      setTitle("");
      setDescription("");
      setTeacherId("");
      
      // Redirection après 1.5 secondes
      setTimeout(() => {
        navigate("/admin/courses");
      }, 1500);
      
    } catch (err) {
      console.error("💥 Erreur lors de la création:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminNavbar />
          <main className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            </div>
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
          <div className="max-w-3xl mx-auto">
            {/* En-tête */}
            <div className="mb-8">
              <button
                onClick={() => navigate("/admin/courses")}
                className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
              >
                <span>←</span> Retour aux cours
              </button>
              <h1 className="text-4xl font-bold text-gray-900">
                ➕ Ajouter un nouveau cours
              </h1>
              <p className="text-gray-600 mt-2">
                Remplissez le formulaire ci-dessous pour créer un nouveau cours
              </p>
            </div>

            {/* Messages d'erreur */}
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
            
            {/* Messages de succès */}
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

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
              {/* Titre */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre du cours <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Introduction à Python"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez le contenu du cours, les objectifs d'apprentissage, les prérequis..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Sélection du professeur */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Professeur <span className="text-red-500">*</span>
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">-- Sélectionner un professeur --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      👨‍🏫 {teacher.username} ({teacher.email})
                    </option>
                  ))}
                </select>
                {teachers.length === 0 && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                      ⚠️ Aucun professeur disponible. Veuillez d'abord créer un utilisateur avec le rôle "teacher" dans la section Utilisateurs.
                    </p>
                  </div>
                )}
              </div>

              

              {/* Boutons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={teachers.length === 0 || success}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition transform ${
                    teachers.length === 0 || success
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {success ? "✅ Cours créé" : "Créer le cours"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/courses")}
                  disabled={success}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
              </div>

              {/* Note de bas de page */}
              <p className="mt-6 text-sm text-gray-500 text-center">
                <span className="text-red-500">*</span> Champs obligatoires
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}