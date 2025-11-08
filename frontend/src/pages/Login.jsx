import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append("username", email); // FastAPI expects "username"
      formData.append("password", password);

      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Connexion réussie ✅");
        console.log("Token:", data.access_token);

        // Save token to localStorage for later use
        localStorage.setItem("token", data.access_token);

        // Redirect to dashboard page
        window.location.href = "/dashboard";
      } else {
        alert(data.detail || "Erreur de connexion ❌");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Impossible de se connecter au serveur ❌");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", textAlign: "center" }}>
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <button type="submit" style={{ padding: "10px 20px" }}>
          Se connecter
        </button>
      </form>
      <p style={{ marginTop: "15px" }}>
        Pas encore de compte ? <a href="/register">Inscrivez-vous</a>
      </p>
    </div>
  );
}

export default Login;
