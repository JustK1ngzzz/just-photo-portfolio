import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getBlogIndex, getProjectsIndex, isGitHubConfigured } from '@/lib/github';
import {
  FileText, FolderKanban, Star, AlertTriangle, CheckCircle2,
  Plus, ArrowRight, Clock, ExternalLink, Loader2, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import portfolioData from '@/data/portfolio.json';

interface Post {
  title: string; slug: string; date: string;
  status?: string; featured?: boolean;
}
interface Project {
  title: string; slug: string; category?: string;
  year?: string; status?: string; featured?: boolean;
}
interface PortfolioData {
  blog: { posts: Post[] };
  projects: { items: Project[] };
  personal: { name: string };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({
  label, value, sub, icon: Icon, color = 'primary',
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; color?: string;
}) {
  const colors: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    green:   'bg-green-500/10 text-green-500',
    yellow:  'bg-yellow-500/10 text-yellow-500',
    blue:    'bg-blue-500/10 text-blue-500',
  };
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const githubOk = isGitHubConfigured();
  const [data, setData] = useState<PortfolioData>(portfolioData as unknown as PortfolioData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!githubOk) { setLoading(false); return; }
    Promise.all([getBlogIndex(), getProjectsIndex()])
      .then(([blogData, projectsData]) => {
        setData((prev) => ({
          ...prev,
          blog: { posts: blogData as Post[] },
          projects: { items: projectsData as Project[] },
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [githubOk]);

  const posts    = data.blog.posts;
  const projects = data.projects.items;

  const publishedPosts  = posts.filter((p) => p.status !== 'draft');
  const draftPosts      = posts.filter((p) => p.status === 'draft');
  const featuredPosts   = posts.filter((p) => p.featured);
  const featuredProjects = projects.filter((p) => p.featured);
  const draftProjects   = projects.filter((p) => p.status === 'draft');

  const recentPosts    = [...posts].sort((a, b) => b.date?.localeCompare(a.date ?? '') ?? 0).slice(0, 5);
  const recentProjects = projects.slice(0, 5);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{greeting()},</p>
            <h1 className="text-3xl font-bold text-foreground mt-0.5">
              {data.personal?.name?.split(' ')[0] || 'Just'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {githubOk
                ? <span className="inline-flex items-center gap-1.5 text-green-500"><CheckCircle2 className="w-3.5 h-3.5" />GitHub connected</span>
                : <span className="inline-flex items-center gap-1.5 text-yellow-500"><AlertTriangle className="w-3.5 h-3.5" />GitHub not configured</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />View Site
              </Button>
            </a>
          </div>
        </div>

        {/* GitHub warning */}
        {!githubOk && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">GitHub not configured — saves won't work</p>
              <pre className="mt-2 text-xs bg-muted rounded p-3 font-mono text-foreground overflow-x-auto">{`VITE_ADMIN_PASSWORD=your_password
VITE_GITHUB_TOKEN=ghp_xxxx
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=your_repo_name
VITE_GITHUB_BRANCH=main`}</pre>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Blog Posts"  value={posts.length}    sub={`${draftPosts.length} drafts`}          icon={FileText}     color="primary" />
          <StatCard label="Projects"    value={projects.length} sub={`${draftProjects.length} drafts`}       icon={FolderKanban} color="blue" />
          <StatCard label="Featured Posts" value={featuredPosts.length}    sub="shown on home page" icon={Star} color="yellow" />
          <StatCard label="Featured Projects" value={featuredProjects.length} sub="shown on home page" icon={Star} color="green" />
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/blog/new">
              <Button className="gap-2"><Plus className="w-4 h-4" />New Post</Button>
            </Link>
            <Link to="/admin/projects/new">
              <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" />New Project</Button>
            </Link>
            <Link to="/admin/portfolio/personal">
              <Button variant="outline" className="gap-2"><User className="w-4 h-4" />Edit Portfolio</Button>
            </Link>
          </div>
        </div>

        {/* Recent content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Posts */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="font-semibold text-foreground">Recent Posts</p>
              <Link to="/admin/blog" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/admin/blog/${post.slug}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />{post.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3 shrink-0">
                    {post.featured && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">★</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.status === 'draft'
                        ? 'bg-yellow-500/15 text-yellow-400'
                        : 'bg-green-500/15 text-green-400'
                    }`}>
                      {post.status === 'draft' ? 'Draft' : 'Published'}
                    </span>
                  </div>
                </Link>
              ))}
              {recentPosts.length === 0 && (
                <p className="px-5 py-6 text-sm text-muted-foreground text-center">No posts yet.</p>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="font-semibold text-foreground">Recent Projects</p>
              <Link to="/admin/projects" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentProjects.map((project) => (
                <Link
                  key={project.slug}
                  to={`/admin/projects/${project.slug}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {project.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {project.category && (
                        <span className="text-xs text-muted-foreground">{project.category}</span>
                      )}
                      {project.year && (
                        <span className="text-xs text-muted-foreground">· {project.year}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3 shrink-0">
                    {project.featured && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">★</span>
                    )}
                    {project.status === 'draft' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-500/15 text-yellow-400">
                        Draft
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              {recentProjects.length === 0 && (
                <p className="px-5 py-6 text-sm text-muted-foreground text-center">No projects yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
