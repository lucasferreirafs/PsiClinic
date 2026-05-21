import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { AboutSection } from "@/components/landing/about-section"
import { ServicesSection } from "@/components/landing/services-section"
import { BenefitsSection } from "@/components/landing/benefits-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { TeamSection } from "@/components/landing/team-section"
import { FAQSection } from "@/components/landing/faq-section"
import { ContactSection } from "@/components/landing/contact-section"
import { Footer } from "@/components/landing/footer"
import { WhatsAppButton } from "@/components/landing/whatsapp-button"
import { ScrollProgress } from "@/components/landing/scroll-progress"

export function Home() {
  return (
    <main className="min-h-screen">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <BenefitsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <TeamSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
