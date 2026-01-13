import React from "react";


export default function AdminTable({ data, columns, onRoleChange }) {
  return (
    <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
      <thead className="bg-gray-200">
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="text-left px-4 py-2">
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-b">
            {columns.map((col) => (
              <td key={col.key} className="px-4 py-2">
                {col.key === "role" ? (
                  <select
                    value={row.role}
                    onChange={(e) => onRoleChange(row.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="student">Étudiant</option>
                    <option value="teacher">Professeur</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  row[col.key].toString()
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
