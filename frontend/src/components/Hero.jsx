import heroImage from "../assets/pic.jpg";

export default function Hero() {
  return (
    <section
      className="relative w-full h-[800px] bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Texte */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 text-white">
        <h2 className="text-5xl font-bold">Apprenez aujourd’hui</h2>
        <h1 className="text-7xl font-extrabold mt-2">Les compétences de demain</h1>
        <p className="text-xl mt-4">Cours pratiques en robotique, IA et automatisation
</p>
      </div>
    </section>
  );
}
