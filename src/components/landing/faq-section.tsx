"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Como funciona a primeira consulta?",
    answer: "A primeira consulta é um momento de acolhimento e escuta. O psicólogo irá conhecer sua história, entender suas demandas e explicar como funciona o processo terapêutico. É uma sessão sem compromisso, onde você pode tirar todas as suas dúvidas e avaliar se há identificação com o profissional.",
  },
  {
    question: "O atendimento online funciona?",
    answer: "Sim! O atendimento online é tão eficaz quanto o presencial. Utilizamos plataformas seguras e criptografadas para garantir sua privacidade. Você pode realizar suas sessões de qualquer lugar, mantendo a mesma qualidade e profundidade do trabalho terapêutico.",
  },
  {
    question: "A clínica atende convênios?",
    answer: "Sim, trabalhamos com os principais convênios de saúde. Entre em contato conosco para verificar se seu plano está na nossa lista de conveniados. Também oferecemos valores especiais para pagamento particular.",
  },
  {
    question: "Qual a duração das sessões?",
    answer: "As sessões de psicoterapia têm duração média de 50 minutos. A frequência é geralmente semanal, mas pode ser ajustada de acordo com suas necessidades e disponibilidade, sempre em acordo com seu psicólogo.",
  },
  {
    question: "Como agendar uma consulta?",
    answer: "Você pode agendar sua consulta pelo WhatsApp, telefone ou preenchendo o formulário de contato em nosso site. Nossa equipe retornará em até 24 horas úteis para confirmar o agendamento e esclarecer qualquer dúvida.",
  },
]

export function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card to-background" />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Perguntas Frequentes
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">
            Tire suas dúvidas
          </h2>
          <p className="text-muted-foreground text-lg">
            Respondemos as perguntas mais comuns sobre nossos serviços.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={`bg-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? "border-primary/30 shadow-lg"
                    : "border-border/50 hover:border-primary/20"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-primary" />
                  </motion.div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
