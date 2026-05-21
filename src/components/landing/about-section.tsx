"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Heart, Users, Video, Award, CheckCircle2 } from "lucide-react"

const features = [
  {
    icon: Heart,
    title: "Atendimento Humanizado",
    description: "Cada paciente é único e merece um tratamento personalizado e acolhedor.",
  },
  {
    icon: Users,
    title: "Profissionais Qualificados",
    description: "Equipe de psicólogos com formação sólida e experiência comprovada.",
  },
  {
    icon: Video,
    title: "Consultas Online",
    description: "Atendimento remoto com a mesma qualidade das sessões presenciais.",
  },
  {
    icon: Award,
    title: "Ambiente Acolhedor",
    description: "Espaço projetado para proporcionar conforto e segurança emocional.",
  },
]

const highlights = [
  "Sigilo profissional garantido",
  "Flexibilidade de horários",
  "Atendimento a convênios",
  "Primeira consulta com desconto",
]

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="sobre" className="py-24 bg-card relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,var(--primary)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Sobre a PsiClinic
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 text-balance">
              Sua jornada de autoconhecimento começa aqui
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              A PsiClinic é uma clínica de psicologia dedicada a oferecer atendimento de excelência
              em saúde mental. Nossa missão é proporcionar um espaço seguro e acolhedor onde cada
              pessoa possa desenvolver seu potencial emocional e encontrar equilíbrio.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Com mais de 10 anos de experiência, nossa equipe multidisciplinar está preparada para
              atender às mais diversas demandas psicológicas, sempre com ética, profissionalismo e
              o cuidado que você merece.
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group p-6 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
