"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Calendar, Settings, Video, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: Calendar,
    number: "01",
    title: "Agende sua consulta",
    description: "Entre em contato pelo WhatsApp, telefone ou formulário online e escolha o melhor horário para você.",
  },
  {
    icon: Settings,
    number: "02",
    title: "Escolha o formato",
    description: "Opte pelo atendimento presencial em nossa clínica ou online, no conforto da sua casa.",
  },
  {
    icon: Video,
    number: "03",
    title: "Realize sua sessão",
    description: "Conheça seu psicólogo e inicie sua jornada de autoconhecimento em um ambiente seguro.",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Acompanhe sua evolução",
    description: "Continue suas sessões regulares e observe seu progresso em direção ao bem-estar emocional.",
  },
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="como-funciona" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">
            Simples e acolhedor desde o início
          </h2>
          <p className="text-muted-foreground text-lg">
            Conheça o passo a passo para começar seu tratamento conosco.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-accent/50 to-secondary/50 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Content Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`flex-1 p-8 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all ${
                    index % 2 === 0 ? "md:text-right" : ""
                  }`}
                >
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-4xl font-bold text-primary/20">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>

                {/* Center Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                  className="hidden md:flex w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10"
                />

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
