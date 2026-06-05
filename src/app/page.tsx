import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { SpecialtySection } from "@/components/landing/SpecialtySection";
import { PricingSection } from "@/components/landing/PricingSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <SpecialtySection />
      <PricingSection />
      <Footer />
    </main>
  );
}
