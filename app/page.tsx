import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { GolfSection } from "@/components/golf-section";
import { BlogSection } from "@/components/blog-section";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <GolfSection />
      <BlogSection />
      <SiteFooter />
    </main>
  );
}
