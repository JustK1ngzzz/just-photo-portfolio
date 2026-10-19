import { Mail, MapPin, Phone } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';

export function ContactSection() {
  const { contact, personal } = portfolioData;
  const phoneDisplay = personal.phone;

  return (
    <section id="contact" className="section-padding bg-card">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Info */}
          <div className="space-y-8">
            <div>
              <p className="text-primary font-mono text-sm mb-2">// Contact</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {contact.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {contact.subtitle}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <a
                href={`mailto:${personal.email}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">邮箱</p>
                  <p className="font-medium text-foreground">{personal.email}</p>
                </div>
              </a>

              {phoneDisplay && (
                <a
                  href={`tel:${phoneDisplay}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Phone className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">电话</p>
                    <p className="font-medium text-foreground">{phoneDisplay}</p>
                  </div>
                </a>
              )}

              <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">坐标</p>
                  <p className="font-medium text-foreground">{personal.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Email CTA */}
          <div className="p-8 md:p-10 rounded-2xl bg-background border border-border card-shadow flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">聊聊你想拍的画面</h3>
              <p className="text-muted-foreground max-w-sm">
                告诉我你的角色、想拍的风格和时间，我会尽快回复你。
              </p>
            </div>
            <a
              href={`mailto:${personal.email}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              发送约拍邮件
            </a>
            <p className="text-xs text-muted-foreground">
              通常会在一天内回复
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
