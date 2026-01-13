import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import AdminTable from "../../components/adminTable";

export default function Users() {
  const [users, setUsers] = useState([]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://127.0.0.1:8000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Erreur:", err);
      }
    };
    fetchUsers();
  }, []);

  // Changer le rôle d'un utilisateur
  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://127.0.0.1:8000/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Erreur lors du changement de rôle:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar onLogout={handleLogout} />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Gestion des utilisateurs</h1>
          <AdminTable data={users} onRoleChange={handleRoleChange} />
        </main>
      </div>
    </div>
  );
}
