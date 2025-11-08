import { useEffect, useState } from "react";
import axios from "axios";

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Pour l'instant on teste avec une URL de back par défaut
    axios.get("http://127.0.0.1:8000/courses/")
      .then(res => setCourses(res.data))
      .catch(err => {
        console.error(err);
        // tu peux afficher un message d'erreur à l'utilisateur
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📚 Liste des cours</h2>
      {courses.length === 0 ? (
        <p>Aucun cours trouvé (ou en attente de connexion à l'API)</p>
      ) : (
        <ul>
          {courses.map(c => <li key={c.id}>{c.title}</li>)}
        </ul>
      )}
    </div>
  );
}
