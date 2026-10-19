import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';
import { siteSettings } from '@/lib/siteSettings';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const hash = href.substring(1);
      if (isHomePage) {
        e.preventDefault();
        const element = document.querySelector(hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        e.preventDefault();
        navigate('/' + hash);
      }
    }
  };

  const getDisplayHref = (href: string) => {
    if (href.startsWith('/#') && isHomePage) return href.substring(1);
    return href;
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container-wide py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={siteSettings.logo}
                alt={siteSettings.siteName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold text-foreground">
                {siteSettings.siteName}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              {siteSettings.footer.description}
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-1">
              {portfolioData.personal.social.linkedin && (
                <a
                  href={portfolioData.personal.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
              )}
              {portfolioData.personal.social.github && (
                <a
                  href={portfolioData.personal.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {siteSettings.footer.quickLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={getDisplayHref(link.href)}
                      onClick={(e) => handleHashClick(e, link.href)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} className="text-primary" />
                <a href={`mailto:${portfolioData.personal.email}`} className="hover:text-primary transition-colors">
                  {portfolioData.personal.email}
                </a>
              </li>
              {portfolioData.personal.phone && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={16} className="text-primary" />
                  <a href={`tel:${portfolioData.personal.phone.replace(/\D/g, '')}`} className="hover:text-primary transition-colors">
                    {portfolioData.personal.phone}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} className="text-primary" />
                {portfolioData.personal.location}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} {siteSettings.siteName}. {siteSettings.footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
