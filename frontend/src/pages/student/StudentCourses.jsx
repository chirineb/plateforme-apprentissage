import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import StudentNavbar from "../../components/StudentNavbar";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Impossible de charger les cours");

        const data = await res.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  useEffect(() => {
    const filtered = courses.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [search, courses]);

  if (loading) return <p className="p-8">Chargement...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentNavbar />

        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6">📚 Mes cours</h1>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border rounded w-full md:w-1/3"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredCourses.length === 0 ? (
              <p className="text-gray-500">Aucun cours trouvé</p>
            ) : (
              filteredCourses.map(course => (
                <div
                  key={course.id}
                  className="bg-white p-6 rounded shadow cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <p className="text-gray-600 mt-2">{course.description}</p>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
