import { Quote } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';

export function TestimonialsSection() {
  const { testimonials } = portfolioData;

  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-primary font-mono text-sm mb-2">// Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {testimonials.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {testimonials.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.items.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-card border border-border card-shadow relative"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />

              {/* Quote */}
              <p className="text-foreground mb-6 italic leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {testimonial.author}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
