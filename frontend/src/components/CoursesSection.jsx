import { Link } from "react-router-dom";
import { useState } from "react";

export default function CoursesSection() {
  const courses = [
    {
      title: "Mobile App Development",
      text: "A Website is an extension of yourself and we can help you to express it properly.",
      icon: "📱",
      slug: "mobile-app-development",
    },
    {
      title: "Web Design & Development",
      text: "Your website is your number one marketing asset because we live in a digital age.",
      icon: "💻",
      slug: "web-design-development",
    },
    {
      title: "Intelligence Artificielle",
      text: "Découvrez le machine learning et l’IA à travers des exemples concrets.",
      icon: "🧠",
      slug: "intelligence-artificielle",
    },
    {
      title: "Robotique",
      text: "Apprenez les bases et les applications pratiques de la robotique moderne.",
      icon: "🤖",
      slug: "robotique",
    },
    {
      title: "Automatisation Industrielle",
      text: "Maîtrisez les systèmes automatisés, capteurs et automates programmables.",
      icon: "⚙️",
      slug: "automatisation-industrielle",
    },
  ];

  const [index, setIndex] = useState(0);
  const visibleCards = 3;

  const next = () => {
    if (index < courses.length - visibleCards) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <section className="py-20 px-10">
      <h2 className="text-3xl font-bold text-center mb-12">
        Nos Formations
      </h2>

      <div className="relative">

        {/* SLIDER */}
        <div className="overflow-hidden">
          <div
            className="flex gap-8 transition-transform duration-500"
            style={{
              transform: `translateX(-${index * (100 / visibleCards)}%)`,
            }}
          >
            {courses.map((c, i) => (
              <Link
                key={i}
                to={`/courses/${c.slug}`}
                className="min-w-[33.333%]"
              >
                <div className="p-8 shadow-lg rounded-xl border hover:shadow-2xl transition bg-white text-center">
                  <div className="text-4xl">{c.icon}</div>
                  <h3 className="text-xl font-bold mt-4">{c.title}</h3>
                  <p className="mt-3 text-gray-600">{c.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100"
        >
          ◀
        </button>

        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100"
        >
          ▶
        </button>
      </div>
    </section>
  );
}
