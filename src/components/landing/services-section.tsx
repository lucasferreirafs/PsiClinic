"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  User, 
  Heart, 
  Baby, 
  Brain, 
  CloudRain, 
  Laptop,
  ArrowRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: User,
    title: "Psicoterapia Individual",
    description: "Atendimento personalizado para adultos, focado em suas necessidades específicas e desenvolvimento pessoal.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Heart,
    title: "Terapia para Casais",
    description: "Fortaleça sua relação com comunicação efetiva, resolução de conflitos e renovação da conexão emocional.",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: Baby,
    title: "Atendimento Infantil",
    description: "Cuidado especializado para crianças, usando técnicas lúdicas e acolhedoras para o desenvolvimento saudável.",
    color: "from-secondary/30 to-secondary/10",
  },
  {
    icon: Brain,
    title: "Terapia para Ansiedade",
    description: "Técnicas comprovadas para gerenciar a ansiedade e retomar o controle da sua vida com serenidade.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: CloudRain,
    title: "Terapia para Depressão",
    description: "Acompanhamento sensível e eficaz para superar a depressão e redescobrir o prazer de viver.",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: Laptop,
    title: "Atendimento Online",
    description: "Sessões por vídeo com a mesma qualidade do presencial, no conforto e privacidade do seu espaço.",
    color: "from-secondary/30 to-secondary/10",
  },
]

export function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="servicos" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/30 to-background" />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Nossos Serviços
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">
            Atendimento especializado para cada necessidade
          </h2>
          <p className="text-muted-foreground text-lg">
            Oferecemos uma variedade de serviços terapêuticos para ajudá-lo em sua jornada de bem-estar.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 h-full shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                {/* Glassmorphism overlay */}
                <div className={`absolute inset-0 bg-linear-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors"
                  >
                    <service.icon className="w-7 h-7 text-primary" />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="flex items-center text-primary font-medium text-sm group-hover:underline"
                  >
                    Saiba mais
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-2xl"
            asChild
          >
            <a href="#contato">
              Agende sua Consulta
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
