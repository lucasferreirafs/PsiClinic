"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"

const contactInfo = [
  {
    icon: Phone,
    label: "Telefone",
    value: "(11) 99999-9999",
    href: "tel:+5511999999999",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "contato@psiclinic.com.br",
    href: "mailto:contato@psiclinic.com.br",
  },
  {
    icon: MapPin,
    label: "Endereço",
    value: "Av. Paulista, 1000 - São Paulo, SP",
    href: "https://maps.google.com",
  },
  {
    icon: Clock,
    label: "Horário",
    value: "Seg a Sex: 8h às 20h | Sáb: 8h às 14h",
  },
]

export function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <section id="contato" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Contato
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">
            Entre em contato conosco
          </h2>
          <p className="text-muted-foreground text-lg">
            Estamos prontos para atendê-lo e esclarecer suas dúvidas.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    Mensagem enviada!
                  </h3>
                  <p className="text-muted-foreground">
                    Retornaremos em breve. Obrigado pelo contato!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Nome
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Telefone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Assunto
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="agendamento">Agendar consulta</option>
                      <option value="informacoes">Informações sobre serviços</option>
                      <option value="convenios">Dúvidas sobre convênios</option>
                      <option value="outros">Outros assuntos</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="Como podemos ajudá-lo?"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl text-lg"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Enviar Mensagem
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Contact Cards */}
            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all"
                >
                  {info.href ? (
                    <a
                      href={info.href}
                      target={info.href.startsWith("http") ? "_blank" : undefined}
                      rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{info.label}</p>
                      <p className="text-sm font-medium text-foreground">{info.value}</p>
                    </a>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{info.label}</p>
                      <p className="text-sm font-medium text-foreground">{info.value}</p>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="rounded-2xl overflow-hidden border border-border/50 shadow-lg h-75 bg-muted"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975870299897!2d-46.6543407!3d-23.5643245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da PsiClinic"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
