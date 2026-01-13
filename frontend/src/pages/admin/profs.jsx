import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

export default function Profs() {
  const [profs, setProfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Fetch professors
  useEffect(() => {
    const fetchProfs = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (role !== "admin") {
          setError("Accès non autorisé");
          setTimeout(() => navigate("/dashboard"), 2000);
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setProfs(data.filter((u) => u.role === "teacher"));
      } catch (err) {
        setError("Impossible de contacter le serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchProfs();
  }, [navigate]);

  // Toggle active
  const toggleActive = async (id, isActive) => {
    const token = localStorage.getItem("token");
    await fetch(`http://127.0.0.1:8000/admin/users/${id}/toggle_active`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    setProfs(
      profs.map((p) =>
        p.id === id ? { ...p, is_active: !isActive } : p
      )
    );
  };

  // Change role (teacher -> admin)
  const changeRole = async (id, newRole) => {
    const token = localStorage.getItem("token");
    await fetch(`http://127.0.0.1:8000/admin/users/${id}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: newRole }),
    });

    setSuccessMessage("Rôle mis à jour avec succès");
    setProfs(profs.filter((p) => p.id !== id));
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Delete professor
  const deleteProf = async (id) => {
    if (!window.confirm("Supprimer ce professeur ?")) return;

    const token = localStorage.getItem("token");
    await fetch(`http://127.0.0.1:8000/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setProfs(profs.filter((p) => p.id !== id));
  };

  if (loading) return <div className="p-10">Chargement...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1">
        <AdminNavbar />

        <main className="p-8">
          {/* HEADER + BOUTON RETOUR */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                👨‍🏫 Gestion des Professeurs
              </h1>
              <p className="text-gray-600">
                {profs.length} professeur{profs.length > 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              ← Retour
            </button>
          </div>

          {successMessage && (
            <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
              ✅ {successMessage}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Nom</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Statut</th>
                  <th className="px-6 py-4 text-left">Inscription</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {profs.map((prof, i) => (
                  <tr
                    key={prof.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <td className="px-6 py-4">#{prof.id}</td>
                    <td className="px-6 py-4 font-medium">
                      {prof.username}
                    </td>
                    <td className="px-6 py-4">{prof.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          prof.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {prof.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(prof.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() =>
                            toggleActive(prof.id, prof.is_active)
                          }
                          className="px-3 py-1 text-xs rounded bg-orange-100 text-orange-700"
                        >
                          {prof.is_active ? "Désactiver" : "Activer"}
                        </button>

                        <select
                          onChange={(e) =>
                            changeRole(prof.id, e.target.value)
                          }
                          defaultValue=""
                          className="px-2 py-1 text-xs border rounded"
                        >
                          <option value="" disabled>
                            Changer rôle
                          </option>
                          <option value="admin">🔐 Admin</option>
                        </select>

                        <button
                          onClick={() => deleteProf(prof.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
