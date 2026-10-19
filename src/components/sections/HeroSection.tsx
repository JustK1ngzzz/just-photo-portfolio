import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';
import portfolioData from '@/data/portfolio.json';

export function HeroSection() {
  const { hero, personal } = portfolioData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const terminalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
        delay: 0.6,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Photo */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/photography/hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/70 via-background/55 to-background" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />

      <motion.div
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [10, -10, 10],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
      />

      {/* Animated Pulse Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 right-1/3 w-4 h-4 bg-primary rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-primary rounded-full"
      />

      {/* Grid Pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.02 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <ParticlesBackground />

      <div className="container-wide relative z-10 pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Status Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <span className="text-sm text-primary font-medium">{portfolioData.contact.availability}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
          >
            {hero.headline}
            <br />
            <motion.span
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="gradient-text inline-block"
              style={{
                backgroundSize: "200% auto",
              }}
            >
              {hero.highlightedText}
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance"
          >
            {hero.subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="group" asChild>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {hero.primaryCta}
                <motion.span
                  className="ml-2 inline-block"
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.span>
              </motion.a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {hero.secondaryCta}
              </motion.a>
            </Button>
          </motion.div>

          {/* Terminal Preview */}
          <motion.div
            variants={terminalVariants}
            initial="hidden"
            animate="visible"
            className="mt-16 md:mt-24"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="terminal max-w-lg mx-auto text-left"
            >
              <div className="terminal-header">
                <motion.span
                  whileHover={{ scale: 1.2 }}
                  className="terminal-dot bg-destructive/60"
                />
                <motion.span
                  whileHover={{ scale: 1.2 }}
                  className="terminal-dot bg-primary/60"
                />
                <motion.span
                  whileHover={{ scale: 1.2 }}
                  className="terminal-dot bg-primary/60"
                />
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-muted-foreground">$</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.3 }}
                    className="text-primary ml-2"
                  >
                    frame
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-primary ml-1"
                  >
                    |
                  </motion.span>
                </p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                  className="text-foreground"
                >
                  {personal.name}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 0.4 }}
                  className="text-muted-foreground text-xs mt-2"
                >
                  # {personal.tagline}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.a
            href="#about"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-muted-foreground hover:text-primary transition-colors block"
          >
            <ChevronDown size={32} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
