import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/EdiBoost.png"; 

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition" onClick={() => navigate("/")}>
        <img src={logo} alt="EDIBoost Logo" className="h-12 w-auto object-contain"/>
        <span className="text-xl font-bold text-gray-800">EDIBoost</span>
      </div>

      
      <div className="flex items-center space-x-4">
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-sm">
          🔐 Admin Panel
        </div>


        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium shadow-md"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}