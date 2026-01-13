import React, { useEffect, useState } from "react";
import StudentNavbar from "../../components/StudentNavbar";
import StudentSidebar from "../../components/StudentSidebar";
import { useNavigate } from "react-router-dom";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "student") {
      navigate("/login");
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/student/results", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Impossible de charger les résultats");

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token, role, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <StudentNavbar />
          <main className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des résultats...</p>
          </main>
        </div>
      </div>
    );
  }

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentNavbar />
        <main className="p-8 max-w-6xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-8">📊 Mes Résultats</h1>

          {results.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-500">
                Vous n’avez pas encore passé de quiz ou terminé de cours.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-3">Cours / Quiz</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res, i) => (
                    <tr
                      key={res.id}
                      className={`${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="px-6 py-4 font-medium">
                        {res.course_title || res.quiz_title}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {res.score}%
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            res.passed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {res.passed ? "Réussi ✅" : "Échoué ❌"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(res.date_taken).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
