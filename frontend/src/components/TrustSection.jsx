import avantage from "../assets/avan.jpg";

export default function AdvantagesSection() {
  const advantages = [
    {
      icon: "🎓",
      title: "Formations pratiques",
      text: "Des cours orientés projets concrets pour une montée en compétences rapide.",
    },
    {
      icon: "👨‍🏫",
      title: "Experts qualifiés",
      text: "Apprenez avec des formateurs expérimentés du monde professionnel.",
    },
    {
      icon: "⏱️",
      title: "Apprentissage flexible",
      text: "Accédez aux cours à tout moment et avancez à votre rythme.",
    },
    {
      icon: "🚀",
      title: "Compétences demandées",
      text: "Des formations alignées avec les besoins du marché du travail.",
    },
  ];

  return (
    <section className="py-24 px-10 bg-gray-50">

      
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-black">
          Nos Avantages
        </h2>
        <p className="text-gray-600 mt-3">
          Pourquoi choisir notre plateforme e-learning ?
        </p>
      </div>

      
      <div className="grid md:grid-cols-2 gap-14 items-center">

        
        <div className="grid sm:grid-cols-2 gap-6">
          {advantages.map((adv, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-lg transition"
            >
              <div className="text-3xl">{adv.icon}</div>
              <h3 className="font-semibold text-lg mt-3">
                {adv.title}
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                {adv.text}
              </p>
            </div>
          ))}
        </div>

        
        <img
          src={avantage}
          alt="Plateforme e-learning"
          className="rounded-2xl shadow-xl w-full max-h-[420px] object-cover"
        />

      </div>

    </section>
  );
}
