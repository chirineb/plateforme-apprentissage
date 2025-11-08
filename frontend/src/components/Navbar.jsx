import React from "react";

export default function Navbar({ onLogout }) {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2">☰</button>
        <input
          type="text"
          placeholder="Rechercher un cours..."
          className="border rounded-lg p-2 w-80"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-700">Bienvenue, Utilisateur</span>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
