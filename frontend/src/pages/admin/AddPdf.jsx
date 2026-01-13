import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

export default function AddPdf() {
  const { id } = useParams(); // course_id
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError("Seuls les fichiers PDF sont acceptés");
        setFile(null);
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10 MB max
        setError("Le fichier est trop volumineux (max 10 MB)");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Le titre est obligatoire");
      return;
    }

    if (!file) {
      setError("Veuillez sélectionner un fichier PDF");
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("course_id", id);
      formData.append("title", title.trim());
      formData.append("file", file);

      console.log("📤 Envoi du PDF...");

      const res = await fetch("http://127.0.0.1:8000/pdfs/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("📥 Statut:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erreur lors de l'upload");
      }

      const result = await res.json();
      console.log("✅ PDF uploadé:", result);

      setSuccess("✅ PDF ajouté avec succès !");
      
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <button
                onClick={() => navigate(`/admin/courses/${id}`)}
                className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
              >
                <span>←</span> Retour au cours
              </button>
              <h1 className="text-4xl font-bold text-gray-900">
                📄 Ajouter un PDF
              </h1>
              <p className="text-gray-600 mt-2">
                Téléchargez un document PDF pour ce cours
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

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre du document <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Chapitre 1 - Introduction"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fichier PDF <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="text-6xl mb-4">📄</div>
                    {file ? (
                      <div>
                        <p className="font-semibold text-green-600">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-700">
                          Cliquez pour sélectionner un PDF
                        </p>
                        <p className="text-sm text-gray-500">ou glissez-déposez</p>
                        <p className="text-xs text-gray-400 mt-2">Max 10 MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !file}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition ${
                    loading || !file
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "⏳ Upload en cours..." : "📤 Uploader le PDF"}
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