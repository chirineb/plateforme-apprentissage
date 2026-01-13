import React, { useEffect, useState } from "react";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/admin/pdfs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Liste des étudiants</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border">ID</th>
            <th className="py-2 px-4 border">Nom d’utilisateur</th>
            <th className="py-2 px-4 border">Email</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td className="py-2 px-4 border">{student.id}</td>
              <td className="py-2 px-4 border">{student.username}</td>
              <td className="py-2 px-4 border">{student.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
