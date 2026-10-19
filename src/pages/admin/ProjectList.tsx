import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getFile, updateFile, getProjectsIndex, isGitHubConfigured } from '@/lib/github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, ExternalLink, Loader2,
  AlertCircle, Star, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import portfolioData from '@/data/portfolio.json';

type Project = (typeof portfolioData.projects.items)[number] & {
  liveUrl?: string;
  featured?: boolean;
  status?: 'published' | 'draft';
};

const PER_PAGE = 10;
type Filter = 'all' | 'published' | 'draft' | 'featured';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>(portfolioData.projects.items as Project[]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getProjectsIndex()
      .then((data) => {
        if (data) setProjects(data as Project[]);
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  // Reset page when search/filter changes
  useEffect(() => { setPage(1); }, [search, filter]);

  const filtered = useMemo(() => {
    let result = projects;
    if (filter === 'published') result = result.filter((p) => p.status !== 'draft');
    if (filter === 'draft')     result = result.filter((p) => p.status === 'draft');
    if (filter === 'featured')  result = result.filter((p) => p.featured);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    all:       projects.length,
    published: projects.filter((p) => p.status !== 'draft').length,
    draft:     projects.filter((p) => p.status === 'draft').length,
    featured:  projects.filter((p) => p.featured).length,
  };

  async function handleToggleFeatured(slug: string, current: boolean) {
    if (!isGitHubConfigured()) {
      toast.error('GitHub is not configured — set VITE_GITHUB_TOKEN in .env.local');
      return;
    }
    setTogglingSlug(slug);
    try {
      const newFeatured = !current;

      // Update projects-index.json
      const { content: idxRaw, sha: idxSha } = await getFile('public/projects-index.json');
      const idx = JSON.parse(idxRaw);
      const idxPos = idx.findIndex((p: Project) => p.slug === slug);
      if (idxPos >= 0) idx[idxPos].featured = newFeatured;
      await updateFile('public/projects-index.json', JSON.stringify(idx, null, 2) + '\n', idxSha,
        `admin: ${newFeatured ? 'feature' : 'unfeature'} project "${slug}"`);

      // Update portfolio.json — add or remove from featured list
      const { content: rawJson, sha } = await getFile('src/data/portfolio.json');
      const full = JSON.parse(rawJson);
      if (newFeatured) {
        // Add to featured list if not already there
        const exists = full.projects.items.find((p: Project) => p.slug === slug);
        if (!exists) {
          const project = projects.find((p) => p.slug === slug);
          if (project) full.projects.items.unshift({ ...project, featured: true });
        } else {
          exists.featured = true;
        }
      } else {
        // Remove from featured list
        full.projects.items = full.projects.items.filter((p: Project) => p.slug !== slug);
      }
      await updateFile('src/data/portfolio.json', JSON.stringify(full, null, 2) + '\n', sha,
        `admin: ${newFeatured ? 'feature' : 'unfeature'} project "${slug}"`);

      setProjects((prev) => prev.map((p) => p.slug === slug ? { ...p, featured: newFeatured } : p));
      toast.success(newFeatured ? 'Project featured on home page' : 'Removed from home page');
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTogglingSlug(null);
    }
  }

  async function handleDelete(slug: string) {
    if (!isGitHubConfigured()) {
      toast.error('GitHub is not configured — set VITE_GITHUB_TOKEN in .env.local');
      return;
    }
    if (confirmDelete !== slug) { setConfirmDelete(slug); return; }
    setDeletingSlug(slug);
    setConfirmDelete(null);
    try {
      // Remove from projects-index.json
      const { content: idxRaw, sha: idxSha } = await getFile('public/projects-index.json');
      const idx = JSON.parse(idxRaw);
      const newIdx = idx.filter((p: Project) => p.slug !== slug);
      await updateFile('public/projects-index.json', JSON.stringify(newIdx, null, 2) + '\n', idxSha,
        `admin: delete project "${slug}"`);

      // Remove from portfolio.json (if featured)
      const { content: rawJson, sha: jsonSha } = await getFile('src/data/portfolio.json');
      const full = JSON.parse(rawJson);
      full.projects.items = full.projects.items.filter((p: Project) => p.slug !== slug);
      await updateFile('src/data/portfolio.json', JSON.stringify(full, null, 2) + '\n', jsonSha,
        `admin: delete project "${slug}"`);

      // Delete .md file
      try {
        const { sha: mdSha } = await getFile(`public/projects/${slug}.md`);
        const { deleteFile } = await import('@/lib/github');
        await deleteFile(`public/projects/${slug}.md`, mdSha, `admin: delete project "${slug}"`);
      } catch { /* md may not exist */ }

      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeletingSlug(null);
    }
  }

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'all',       label: `All (${counts.all})` },
    { key: 'published', label: `Published (${counts.published})` },
    { key: 'draft',     label: `Drafts (${counts.draft})` },
    { key: 'featured',  label: `Featured (${counts.featured})` },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">
              {loadingList ? 'Loading...' : `${projects.length} projects total`}
            </p>
          </div>
          <Link to="/admin/projects/new">
            <Button><Plus className="w-4 h-4 mr-2" />New Project</Button>
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or slug..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1 shrink-0">
            {filterTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading shimmer */}
        {loadingList && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />Syncing with GitHub...
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {paginated.map((project) => (
            <div
              key={project.slug}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{project.title}</p>
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {project.category}
                  </span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    project.status === 'draft'
                      ? 'bg-yellow-500/15 text-yellow-400'
                      : 'bg-green-500/15 text-green-400'
                  }`}>
                    {project.status === 'draft' ? 'Draft' : 'Published'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{project.year}</span>
                  <span>·</span>
                  <span>{project.metrics}</span>
                  <span>·</span>
                  <code className="bg-muted px-1 rounded">{project.slug}</code>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="icon"
                  className={`h-8 w-8 ${project.featured ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`}
                  onClick={() => handleToggleFeatured(project.slug, !!project.featured)}
                  disabled={togglingSlug === project.slug}
                  title={project.featured ? 'Remove from home page' : 'Feature on home page'}
                >
                  {togglingSlug === project.slug
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Star className={`w-4 h-4 ${project.featured ? 'fill-yellow-400' : ''}`} />}
                </Button>

                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" title="View live">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}

                <Link to={`/admin/projects/${project.slug}`} title="Edit">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </Link>

                <Button
                  variant="ghost" size="icon"
                  className={`h-8 w-8 ${confirmDelete === project.slug ? 'text-destructive bg-destructive/10' : 'hover:text-destructive'}`}
                  onClick={() => handleDelete(project.slug)}
                  disabled={deletingSlug === project.slug}
                  title={confirmDelete === project.slug ? 'Click again to confirm' : 'Delete'}
                >
                  {deletingSlug === project.slug
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : confirmDelete === project.slug
                    ? <AlertCircle className="w-4 h-4" />
                    : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}

          {!loadingList && filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              {search ? `No projects match "${search}"` : 'No projects in this filter.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={p === page ? 'default' : 'outline'}
                  size="icon" className="h-8 w-8" onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
