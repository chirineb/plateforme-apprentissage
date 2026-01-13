import EdiBoostLogo from "../assets/EdiBoost.png"; // chemin relatif selon ton composant

export default function Footer() {
  return (
    <footer id="contact" className="bg-white border-t py-12 px-10 grid md:grid-cols-3 gap-8">
      <div>
        <img src={EdiBoostLogo} className="w-16" alt="EDIBoost Logo" />
        <h1 className="text-2xl font-bold text-blue-700 mt-3">EDIBoost</h1>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-3">Links</h3>
        <ul className="flex flex-col gap-2 text-gray-600">
          <li>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 transition"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition"
            >
              Facebook
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition"
            >
              Instagram
            </a>
          </li>
        </ul>
      </div>

      {/* ACCUEIL */}
      <div>
        <h3 className="font-bold text-lg mb-3">Contact</h3>
        <ul className="text-gray-600 space-y-2">
          <li>Num: +216 50 308 417</li>
          <li>Email: EdiBoost@gmail.com</li>
        </ul>
      </div>
    </footer>
  );
}
