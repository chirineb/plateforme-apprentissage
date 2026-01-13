import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔥 CHANGEMENT ICI : FastAPI attend du form-data, pas du JSON
      const formData = new URLSearchParams();
      formData.append('username', email);  // ⚠️ FastAPI OAuth2 utilise "username" même pour l'email
      formData.append('password', password);

      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded"  
        },
        body: formData.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            setError(data.detail[0].msg);
          } else {
            setError(data.detail);
          }
        } else {
          setError("Erreur de connexion ❌");
        }
        return;
      }

      // Succès
      console.log("✅ Login réussi:", data);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      // Debug
      console.log("Token sauvegardé:", localStorage.getItem("token"));
      console.log("Role sauvegardé:", localStorage.getItem("role"));

      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.role === "teacher") {
        navigate("/teacher"); 
      } else if (data.role === "student") {
        navigate("/student"); 
      } else {
        navigate("/"); 
      }


    } catch (err) {
      console.error("Erreur catch:", err);
      setError("Impossible de contacter le serveur ❌");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Connexion
        </button>

        {error && (
          <p className="text-red-500 text-center mt-4">{error}</p>
        )}

        <p className="text-center text-sm mt-4">
          Vous n'avez pas de compte ?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Inscrivez-vous
          </span>
        </p>
      </form>
    </div>
  );
}