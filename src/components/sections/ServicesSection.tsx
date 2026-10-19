import { Camera, Sparkles, MapPin, PenTool, Heart, MessageCircle, Code } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera,
  Sparkles,
  MapPin,
  PenTool,
  Heart,
  MessageCircle,
  Code,
};

export function ServicesSection() {
  const { services } = portfolioData;

  return (
    <section id="services" className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-primary font-mono text-sm mb-2">// Services</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {services.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {services.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.items.map((service, index) => {
            const Icon = iconMap[service.icon] || Code;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-card border border-border card-shadow hover:border-primary/50 hover:glow transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
