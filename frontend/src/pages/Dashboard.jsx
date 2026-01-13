import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar onLogout={handleLogout} />

        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
            Tableau de bord
          </h1>

          {/* Summary Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-lg text-blue-800">Mes cours</h3>
              <p className="text-sm text-gray-600">Accès rapide à vos cours</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-lg text-blue-800">Progression</h3>
              <p className="text-sm text-gray-600">Statistiques d'apprentissage</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-lg text-blue-800">Messages</h3>
              <p className="text-sm text-gray-600">Questions et notifications</p>
            </div>
          </div>

          {/* Courses Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Cours disponibles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Robotique 101", desc: "Introduction aux robots" },
                { title: "IA pour débutants", desc: "Bases du Machine Learning" },
                { title: "Automatisation", desc: "PLC & capteurs" },
              ].map((course, index) => (
                <article
                  key={index}
                  className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="font-bold text-lg text-blue-800">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600">{course.desc}</p>
                  <button className="mt-3 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
                    Voir
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
