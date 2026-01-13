import React from "react";
import logo from "../assets/EdiBoost.png";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-blue-700 text-white flex flex-col p-5">
      {/* Logo en haut */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={logo}
          alt="EDIBoost Logo"
          className="w-30 h-30 rounded-full mb-3"
        />
        <h2 className="text-lg font-bold">EDIBoost</h2>
      </div>

      {/* Liens de navigation */}
      <nav className="flex flex-col gap-3 w-full">
        <a href="/dashboard" className="px-3 py-2 rounded hover:bg-blue-600 w-full">
          🏠 Dashboard
        </a>
        <a href="/courses" className="px-3 py-2 rounded hover:bg-blue-600 w-full">
          📚 Cours
        </a>
        <a href="/profile" className="px-3 py-2 rounded hover:bg-blue-600 w-full">
          👤 Profil
        </a>
        <a href="/settings" className="px-3 py-2 rounded hover:bg-blue-600 w-full">
          ⚙️ Paramètres
        </a>
      </nav>
    </aside>
  );
}
