// src/components/AdminSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();

  const menuItems = [

    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Étudiants", path: "/admin/students" },
    { name: "Professeurs", path: "/admin/profs" },
    { name: "Utilisateurs", path: "/admin/users" },
    { name: "Cours", path: "/admin/courses" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-3 rounded hover:bg-gray-700 transition ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

