import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Fetch students from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (role !== "admin") {
          setError("Accès non autorisé");
          setTimeout(() => navigate("/dashboard"), 2000);
          return;
        }

        if (!token) {
          setError("Token manquant");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/admin/users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            setError("Session expirée");
            localStorage.clear();
            setTimeout(() => navigate("/login"), 2000);
          } else {
            setError(errorData.detail || "Erreur lors du chargement");
          }
          return;
        }

        const data = await response.json();
        // Filter only students
        const studentsOnly = data.filter(user => user.role === "student");
        setStudents(studentsOnly);
      } catch (err) {
        console.error("Erreur fetch:", err);
        setError("Impossible de contacter le serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  // Toggle user active status
  const toggleUserActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/admin/users/${userId}/toggle_active`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message);
        // Update local state
        setStudents(students.map(student => 
          student.id === userId 
            ? { ...student, is_active: !currentStatus }
            : student
        ));
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Erreur lors de la modification");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion");
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setSuccessMessage("Étudiant supprimé avec succès");
        setStudents(students.filter(student => student.id !== userId));
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion");
    }
  };

  // Change user role
  const changeUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        setSuccessMessage(`Rôle modifié en ${newRole}`);
        // Remove from students list if role changed
        setStudents(students.filter(student => student.id !== userId));
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Erreur lors du changement de rôle");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur</h2>
          </div>
          <p className="text-gray-700 mb-6 text-center">{error}</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Retour au dashboard
          </button>
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  👨‍🎓 Gestion des Étudiants
                </h1>
                <p className="text-gray-600">
                  {students.length} étudiant{students.length > 1 ? "s" : ""} inscrit{students.length > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                ← Retour
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              ✅ {successMessage}
            </div>
          )}

          {/* Students Table */}
          {students.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun étudiant trouvé
              </h3>
              <p className="text-gray-500">
                Les étudiants apparaîtront ici une fois inscrits.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nom d'utilisateur</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Niveau</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Statut</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date d'inscription</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr 
                        key={student.id}
                        className={`hover:bg-blue-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          #{student.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {student.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            student.level === "beginner" 
                              ? "bg-green-100 text-green-700"
                              : student.level === "intermediate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {student.level === "beginner" && "🟢 Débutant"}
                            {student.level === "intermediate" && "🟡 Intermédiaire"}
                            {student.level === "advanced" && "🔴 Avancé"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            student.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {student.is_active ? "✅ Actif" : "❌ Inactif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(student.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Toggle Active */}
                            <button
                              onClick={() => toggleUserActive(student.id, student.is_active)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                                student.is_active
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                              title={student.is_active ? "Désactiver" : "Activer"}
                            >
                              {student.is_active ? "🔒 Désactiver" : "✅ Activer"}
                            </button>

                            {/* Change Role */}
                            <select
                              onChange={(e) => changeUserRole(student.id, e.target.value)}
                              className="px-2 py-1 border rounded-lg text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                              defaultValue=""
                            >
                              <option value="" disabled>Changer rôle</option>
                              <option value="teacher">👨‍🏫 Professeur</option>
                              <option value="admin">🔐 Admin</option>
                            </select>

                            {/* Delete */}
                            <button
                              onClick={() => deleteUser(student.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-xs font-medium"
                              title="Supprimer"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}