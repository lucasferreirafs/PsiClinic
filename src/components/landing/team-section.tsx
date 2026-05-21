"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const team = [
  {
    name: "Dra. Carolina Mendes",
    role: "Psicóloga Clínica",
    specialty: "Terapia Cognitivo-Comportamental",
    description: "Especialista em ansiedade e depressão, com mais de 15 anos de experiência em atendimento clínico.",
    image: "CM",
    color: "from-primary to-primary/70",
  },
  {
    name: "Dr. Ricardo Alves",
    role: "Psicólogo",
    specialty: "Psicanálise",
    description: "Focado em desenvolvimento pessoal e autoconhecimento, atende adultos e adolescentes.",
    image: "RA",
    color: "from-accent to-accent/70",
  },
  {
    name: "Dra. Fernanda Costa",
    role: "Psicóloga Infantil",
    specialty: "Ludoterapia",
    description: "Especializada em crianças e adolescentes, utilizando técnicas lúdicas e acolhedoras.",
    image: "FC",
    color: "from-secondary-foreground to-secondary-foreground/70",
  },
  {
    name: "Dr. Marcos Oliveira",
    role: "Psicólogo",
    specialty: "Terapia de Casais",
    description: "Expert em relacionamentos, ajudando casais a construírem conexões mais saudáveis.",
    image: "MO",
    color: "from-primary to-accent",
  },
]

export function TeamSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="equipe" className="py-24 bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
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
            Nossa Equipe
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">
            Profissionais dedicados ao seu bem-estar
          </h2>
          <p className="text-muted-foreground text-lg">
            Conheça os especialistas que fazem parte da nossa equipe.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-background border border-border/50 p-6 text-center hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg`}
                >
                  {member.image}
                </motion.div>

                {/* Info */}
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-primary font-medium mb-1">
                  {member.role}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {member.specialty}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.description}
                </p>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
