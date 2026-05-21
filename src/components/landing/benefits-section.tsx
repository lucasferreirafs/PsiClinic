"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  UserCheck, 
  Shield, 
  Sofa, 
  Clock, 
  Monitor, 
  GraduationCap 
} from "lucide-react"

const benefits = [
  {
    icon: UserCheck,
    title: "Atendimento Personalizado",
    description: "Cada plano de tratamento é único e adaptado às suas necessidades específicas.",
  },
  {
    icon: Shield,
    title: "Sigilo Profissional",
    description: "Total confidencialidade garantida por código de ética profissional.",
  },
  {
    icon: Sofa,
    title: "Ambiente Confortável",
    description: "Espaço acolhedor projetado para proporcionar bem-estar e segurança.",
  },
  {
    icon: Clock,
    title: "Flexibilidade de Horários",
    description: "Horários flexíveis que se adaptam à sua rotina, incluindo finais de semana.",
  },
  {
    icon: Monitor,
    title: "Online e Presencial",
    description: "Escolha o formato de atendimento que melhor se adequa a você.",
  },
  {
    icon: GraduationCap,
    title: "Equipe Especializada",
    description: "Profissionais com formação sólida e constante atualização.",
  },
]

export function BenefitsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Por que escolher a PsiClinic
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">
            Benefícios que fazem a diferença
          </h2>
          <p className="text-muted-foreground text-lg">
            Nossa clínica oferece diferenciais que garantem sua experiência de cuidado em saúde mental.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex gap-4 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="shrink-0">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                >
                  <benefit.icon className="w-6 h-6 text-primary" />
                </motion.div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
