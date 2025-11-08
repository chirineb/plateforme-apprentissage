import React from "react";
import logo from "../assets/logo.png"; // ton logo dans src/assets/

export default function Sidebar() {
  return (
    <aside className="w-60 bg-blue-700 text-white flex flex-col p-4 items-start">
      {/* Logo en haut à gauche */}
      {/* <div className="mb-10 flex items-center">
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 object-contain"
          style={{
            width: "100px",
            height: "100px",
            marginTop: "0",
            marginLeft: "0",
          }}
        />
        <h2 className="text-lg font-semibold ml-3">E-Learn</h2>
      </div> */}
      <img 
      src={logo}
      alt="EDIBoost Logo" 
      className="w-12 h-12 object-contain"  />          
     

      {/* Liens de navigation */}
      <nav className="flex flex-col gap-2 w-full">
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
