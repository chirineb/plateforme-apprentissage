import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import logo from "../assets/EdiBoost.png";
import { Search } from "lucide-react";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useNavigate();

  // ✅ CHANGEMENT 1 : vérifier si l'utilisateur est connecté
  const token = localStorage.getItem("token");

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      console.log("Recherche lancée pour :", searchTerm);
    }
  };

  // ✅ CHANGEMENT 2 : fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 h-16 w-full">

        {/* LEFT: Logo + Menu */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={() => {
              if (token) {
                navigate("/dashboard");}
                else {
                  navigate("/");
                }
            }}>
            <img src={logo} alt ="EDIBoost Logo" className="w-24 object-contain"/>
            <h1 className="text-xl font-semibold text-blue-700">
              EDIBoost
            </h1>
          </div>

          <ul className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
            <li className="hover:text-blue-600 cursor-pointer">
              <Link to="/courses">Cours</Link>
            </li>
            <li
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => {
                const footer = document.getElementById("contact");
                if (footer) footer.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Contact
            </li>
          </ul>
        </div>

        {/* RIGHT: Search + Buttons */}
        <div className="hidden md:flex items-center gap-4">

          {/* Icon Search */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Input de recherche */}
          {isSearchOpen && (
            <input
              type="text"
              placeholder="Rechercher votre cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
            />
          )}

          {/* ✅ CHANGEMENT 3 : affichage conditionnel */}
          {!token ? (
            <>
              {/* Connexion */}
              <Link
                to="/login"
                className="px-5 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Connexion
              </Link>

              {/* Inscription */}
              <Link
                to="/register"
                className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
              >
                Inscription
              </Link>
            </>
          ) : (
            <>
              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="px-5 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Dashboard
              </Link>

              {/* Déconnexion */}
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Déconnexion
              </button>
            </>
          )}

        </div>

        
      </div>
    </nav>
  );
}
