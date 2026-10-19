import portfolioData from '@/data/portfolio.json';

export function AboutSection() {
  const { about } = portfolioData;

  return (
    <section id="about" className="section-padding bg-card">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div>
              <p className="text-primary font-mono text-sm mb-2">// About</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {about.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {about.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              {about.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {about.stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-background border border-border card-shadow text-center group hover:border-primary/50 transition-colors"
              >
                <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Work Process */}
        <div className="mt-20 md:mt-32">
          <div className="text-center mb-12">
            <p className="text-primary font-mono text-sm mb-2">// Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {portfolioData.workProcess.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {portfolioData.workProcess.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.workProcess.steps.map((step, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-background border border-border card-shadow group hover:border-primary/50 transition-all"
              >
                <span className="text-4xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
