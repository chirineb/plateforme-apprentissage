import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CoursesSection from "../components/CoursesSection";
import TrustSection from "../components/TrustSection";
import Partners from "../components/Partners";
import Footer from "../components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <CoursesSection />
      <TrustSection />
      <Partners />
      <Footer />
    </>
  );
}
