import andrew from "../assets/anrdrew.webp";
import jane from "../assets/prof2.jpeg";   
import mark from "../assets/prof3.jpg";

export default function Professors() {
  const profs = [
    { name: "Andrew", photo: andrew },
    { name: "Jane", photo: jane },
    { name: "Mark", photo: mark },
  ];

  return (
    <section className="py-16 px-10 bg-gray-50">
      <h2 className="text-2xl font-bold mb-10 text-center">Nos Professeurs</h2>

      <div className="flex flex-wrap justify-center gap-12">
        {profs.map((prof, i) => (
          <div key={i} className="flex flex-col items-center w-28">
            <img
              src={prof.photo}
              alt={prof.name}
              className="w-28 h-28 rounded-full object-cover shadow-md"
            />
            <p className="mt-3 text-lg font-semibold">{prof.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
