import React from "react";

import { Link, useLocation } from "react-router-dom";

export default function StudentSidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/student", icon: "🏠" },
    { name: "Mes cours", path: "/student/courses", icon: "📚" },
    { name: "Résultats", path: "/student/results", icon: "📊" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">🎓 Student Panel</h2>

      {menu.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`block p-3 rounded mb-2 hover:bg-gray-700 ${
            location.pathname === item.path ? "bg-gray-700" : ""
          }`}
        >
          {item.icon} {item.name}
        </Link>
      ))}
    </div>
  );
}
