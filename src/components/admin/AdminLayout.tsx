import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  ExternalLink,
  LogOut,
  User,
  Zap,
  Info,
  Wrench,
  Star,
  Mail,
  ChevronDown,
  Rocket,
  Loader2,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { siteSettings } from '@/lib/siteSettings';

const DEPLOY_HOOK = import.meta.env.VITE_DEPLOY_HOOK_URL as string | undefined;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const portfolioSections = [
  { to: '/admin/portfolio/personal',     icon: User,  label: 'Personal' },
  { to: '/admin/portfolio/hero',         icon: Zap,   label: 'Hero' },
  { to: '/admin/portfolio/about',        icon: Info,  label: 'About' },
  { to: '/admin/portfolio/services',     icon: Wrench, label: 'Services' },
  { to: '/admin/portfolio/testimonials', icon: Star,  label: 'Testimonials' },
  { to: '/admin/portfolio/contact',      icon: Mail,  label: 'Contact' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const onPortfolio = location.pathname.startsWith('/admin/portfolio');
  const [deploying, setDeploying] = useState(false);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  async function handleDeploy() {
    if (!DEPLOY_HOOK) {
      toast.error('Add VITE_DEPLOY_HOOK_URL to .env.local');
      return;
    }
    setDeploying(true);
    try {
      const res = await fetch(DEPLOY_HOOK, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('Deployment triggered — Vercel is building...');
    } catch (err) {
      toast.error(`Deploy failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-5 border-b border-border">
          <h1 className="text-base font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{siteSettings.siteName}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Dashboard
          </NavLink>

          {/* Blog Posts */}
          <NavLink
            to="/admin/blog"
            end={false}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
          >
            <FileText className="w-4 h-4 shrink-0" />
            Blog Posts
          </NavLink>

          {/* Projects */}
          <NavLink
            to="/admin/projects"
            end={false}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
          >
            <FolderKanban className="w-4 h-4 shrink-0" />
            Projects
          </NavLink>

          {/* Portfolio — always expanded when on portfolio routes */}
          <div>
            <button
              onClick={() => navigate('/admin/portfolio/personal')}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                onPortfolio
                  ? 'text-foreground bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4 shrink-0" />
                Portfolio
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${onPortfolio ? 'rotate-180' : ''}`} />
            </button>

            {onPortfolio && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-3">
                {portfolioSections.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 px-3 h-9 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            onClick={handleDeploy}
            disabled={deploying}
            title={DEPLOY_HOOK ? 'Deploy to Vercel' : 'VITE_DEPLOY_HOOK_URL not set'}
          >
            {deploying
              ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              : <Rocket className="w-4 h-4 shrink-0" />}
            {deploying ? 'Deploying...' : 'Deploy'}
          </Button>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            Site Settings
          </NavLink>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            View Site
          </a>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-destructive px-3 h-9 text-sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
