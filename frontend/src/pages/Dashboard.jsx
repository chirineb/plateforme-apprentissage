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
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>

          {/* Search / summary */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Mes cours</h3>
              <p className="text-sm text-gray-600">Accès rapide à vos cours</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Progression</h3>
              <p className="text-sm text-gray-600">Statistiques d'apprentissage</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Messages</h3>
              <p className="text-sm text-gray-600">Questions et notifications</p>
            </div>
          </div>

          {/* Example courses list */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Cours disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* example card */}
              <article className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Robotique 101</h3>
                <p className="text-sm text-gray-600">Introduction aux robots</p>
                <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded">Voir</button>
              </article>
              <article className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">IA pour débutants</h3>
                <p className="text-sm text-gray-600">Bases du Machine Learning</p>
                <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded">Voir</button>
              </article>
              <article className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Automatisation</h3>
                <p className="text-sm text-gray-600">PLC & capteurs</p>
                <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded">Voir</button>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
