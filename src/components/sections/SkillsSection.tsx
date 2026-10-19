import { Code, Layers, Zap, Camera, PenTool } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Layers,
  Zap,
  Camera,
  PenTool,
};

export function SkillsSection() {
  const { skills } = portfolioData;

  return (
    <section id="skills" className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-primary font-mono text-sm mb-2">// Gear</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {skills.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {skills.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {skills.categories.map((category, index) => {
            const Icon = iconMap[category.icon] || Code;
            return (
              <div
                key={index}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] p-6 rounded-xl bg-card border border-border card-shadow group hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {category.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item, itemIndex) => (
                    <span
                      key={itemIndex}
                      className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
