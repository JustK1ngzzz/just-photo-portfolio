import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { siteSettings } from '@/lib/siteSettings';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="container-wide">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={siteSettings.logo}
              alt={siteSettings.siteName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-semibold text-foreground hidden sm:block group-hover:text-primary transition-colors">
              {siteSettings.siteName.split(' ')[0]}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {siteSettings.nav.map((link) => (
              <li key={link.href}>
                <a
                  href={getDisplayHref(link.href)}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors link-underline py-1"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Theme Toggle & CTA */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <a
                href={getDisplayHref(siteSettings.ctaHref)}
                onClick={(e) => handleNavClick(e, siteSettings.ctaHref)}
              >
                {siteSettings.ctaText}
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-border animate-fade-in">
          <nav className="container-wide py-6">
            <ul className="flex flex-col gap-4">
              {siteSettings.nav.map((link) => (
                <li key={link.href}>
                  <a
                    href={getDisplayHref(link.href)}
                    className="block py-2 text-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                      handleNavClick(e, link.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <Button asChild className="w-full">
                  <a
                    href={getDisplayHref(siteSettings.ctaHref)}
                    onClick={(e) => {
                      handleNavClick(e, siteSettings.ctaHref);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {siteSettings.ctaText}
                  </a>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
