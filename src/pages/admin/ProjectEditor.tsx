import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getFile, updateFile, createFile, getPortfolioJson } from '@/lib/github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import portfolioData from '@/data/portfolio.json';

type RawProject = (typeof portfolioData.projects.items)[number];
interface ProjectMeta extends RawProject {
  liveUrl?: string;
  featured?: boolean;
  status?: 'published' | 'draft';
}

interface ProjectData {
  meta: ProjectMeta;
  content: string;
}

const today = new Date().toISOString().split('T')[0];

const emptyProject: ProjectData = {
  meta: {
    title: '', slug: '', description: '', tags: [],
    metrics: '', year: String(new Date().getFullYear()),
    category: '', liveUrl: '', featured: false, status: 'published',
  },
  content: '',
};

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function parseFrontmatter(raw: string): ProjectData {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { ...emptyProject, content: raw };
  const fm: Record<string, string> = {};
  match[1].split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx > -1) {
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
  return {
    meta: {
      title: fm.title || '',
      slug: fm.slug || '',
      description: fm.description || '',
      tags: fm.tags ? fm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      metrics: fm.metrics || '',
      year: fm.year || String(new Date().getFullYear()),
      category: fm.category || '',
      liveUrl: fm.liveUrl || '',
      featured: fm.featured === 'true',
      status: (fm.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft',
    },
    content: match[2].trim(),
  };
}

function buildMarkdown(data: ProjectData): string {
  const { title, slug, description, tags, metrics, year, category, liveUrl, featured, status } = data.meta;
  return `---
title: "${title}"
slug: "${slug}"
description: "${description}"
tags: "${tags.join(', ')}"
metrics: "${metrics}"
year: "${year}"
category: "${category}"
liveUrl: "${liveUrl || ''}"
featured: "${featured}"
status: "${status}"
---

${data.content}
`;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}

export default function ProjectEditor() {
  const { slug } = useParams<{ slug: string }>();
  const isNew = !slug || slug === 'new';
  const navigate = useNavigate();

  const [data, setData] = useState<ProjectData>(emptyProject);
  const [fileSha, setFileSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  function setMeta(patch: Partial<ProjectMeta>) {
    setData((prev) => {
      const updated = { ...prev, meta: { ...prev.meta, ...patch } };
      if (isNew && 'title' in patch) updated.meta.slug = slugify(patch.title || '');
      return updated;
    });
  }

  useEffect(() => {
    if (isNew) return;

    async function load() {
      let localContent = '';
      let hasFrontmatter = false;

      try {
        const res = await fetch(`/projects/${slug}.md`);
        if (!res.ok) throw new Error('not found');
        const raw = await res.text();
        const parsed = parseFrontmatter(raw);
        if (parsed.meta.title) {
          hasFrontmatter = true;
          setData(parsed);
        } else {
          localContent = parsed.content;
        }
      } catch { /* no file yet */ }

      if (!hasFrontmatter) {
        let found: ProjectMeta | undefined;
        try {
          const full = await getPortfolioJson() as { projects: { items: ProjectMeta[] } };
          found = full.projects.items.find((p) => p.slug === slug);
        } catch {
          found = portfolioData.projects.items.find((p) => p.slug === slug) as ProjectMeta | undefined;
        }
        setData({
          meta: {
            title: found?.title || '',
            slug: found?.slug || slug || '',
            description: found?.description || '',
            tags: found?.tags || [],
            metrics: found?.metrics || '',
            year: found?.year || String(new Date().getFullYear()),
            category: found?.category || '',
            liveUrl: found?.liveUrl || '',
            featured: !!found?.featured,
            status: found?.status || 'published',
          },
          content: localContent,
        });
      }

      try {
        const { sha } = await getFile(`public/projects/${slug}.md`);
        setFileSha(sha);
      } catch { /* SHA not available — will create */ }

      setLoading(false);
    }

    load();
  }, [slug, isNew]);

  async function handleSave() {
    if (!data.meta.title || !data.meta.slug) return;
    setSaving(true);
    try {
      const mdPath = `public/projects/${data.meta.slug}.md`;
      const mdContent = buildMarkdown(data);

      if (fileSha) {
        await updateFile(mdPath, mdContent, fileSha, `admin: update project "${data.meta.slug}"`);
      } else {
        await createFile(mdPath, mdContent, `admin: create project "${data.meta.slug}"`);
      }

      const projectMeta: ProjectMeta = {
        title: data.meta.title,
        slug: data.meta.slug,
        description: data.meta.description,
        tags: data.meta.tags,
        metrics: data.meta.metrics,
        year: data.meta.year,
        category: data.meta.category,
        liveUrl: data.meta.liveUrl,
        featured: data.meta.featured,
        status: data.meta.status,
      };

      // Always update projects-index.json (full index)
      const { content: idxRaw, sha: idxSha } = await getFile('public/projects-index.json');
      const idx = JSON.parse(idxRaw);
      const idxPos = idx.findIndex((p: { slug: string }) => p.slug === data.meta.slug);
      if (idxPos >= 0) {
        idx[idxPos] = projectMeta;
      } else {
        idx.unshift(projectMeta);
      }
      await updateFile('public/projects-index.json', JSON.stringify(idx, null, 2) + '\n', idxSha,
        `admin: update projects index "${data.meta.slug}"`);

      // Update portfolio.json — only keep featured projects there
      const { content: rawJson, sha: jsonSha } = await getFile('src/data/portfolio.json');
      const full = JSON.parse(rawJson);
      if (data.meta.featured) {
        const existingIdx = full.projects.items.findIndex((p: ProjectMeta) => p.slug === data.meta.slug);
        if (existingIdx >= 0) {
          full.projects.items[existingIdx] = projectMeta;
        } else {
          full.projects.items.unshift(projectMeta);
        }
      } else {
        // Remove from featured list if it was there before
        full.projects.items = full.projects.items.filter(
          (p: { slug: string }) => p.slug !== data.meta.slug
        );
      }
      await updateFile('src/data/portfolio.json', JSON.stringify(full, null, 2) + '\n', jsonSha,
        `admin: ${isNew ? 'add' : 'update'} project "${data.meta.slug}"`);

      toast.success('Project saved to GitHub');
      if (isNew) navigate(`/admin/projects/${data.meta.slug}`);
      else {
        try { const { sha } = await getFile(mdPath); setFileSha(sha); } catch { /* ignore */ }
      }
    } catch (err) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin/projects">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{isNew ? 'New Project' : 'Edit Project'}</h1>
              {!isNew && <p className="text-sm text-muted-foreground mt-0.5">Editing public/projects/{slug}.md</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isNew && data.meta.liveUrl && (
              <a href={data.meta.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="gap-2"><ExternalLink className="w-4 h-4" />View Live</Button>
              </a>
            )}
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
              {showPreview ? <><EyeOff className="w-4 h-4" />Hide Preview</> : <><Eye className="w-4 h-4" />Show Preview</>}
            </Button>
            <Button onClick={handleSave} disabled={saving || !data.meta.title || !data.meta.slug} className="gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save to GitHub</>}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground py-8">
            <Loader2 className="w-5 h-5 animate-spin" />Loading project...
          </div>
        ) : (
          <>
            {/* META DETAILS card */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Project Details</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Title" required>
                  <Input value={data.meta.title} onChange={(e) => setMeta({ title: e.target.value })} placeholder="Project name" />
                </Field>
                <Field label="Slug">
                  <Input value={data.meta.slug} readOnly={isNew}
                    onChange={(e) => !isNew && setMeta({ slug: e.target.value })}
                    className={isNew ? 'bg-muted text-muted-foreground' : ''} />
                </Field>
                <Field label="Year">
                  <Input value={data.meta.year} onChange={(e) => setMeta({ year: e.target.value })} placeholder="2025" />
                </Field>
                <Field label="Category">
                  <Input value={data.meta.category} onChange={(e) => setMeta({ category: e.target.value })} placeholder="SaaS Platform" />
                </Field>
                <Field label="Metrics">
                  <Input value={data.meta.metrics} onChange={(e) => setMeta({ metrics: e.target.value })} placeholder="1,000+ users" />
                </Field>
                <Field label="Live URL">
                  <Input value={data.meta.liveUrl || ''} onChange={(e) => setMeta({ liveUrl: e.target.value })} placeholder="https://..." />
                </Field>
                <div className="col-span-2">
                  <Field label="Short Description (shown in cards)">
                    <Textarea value={data.meta.description} rows={2}
                      onChange={(e) => setMeta({ description: e.target.value })} />
                  </Field>
                </div>
                <div className="col-span-2 flex items-end gap-6">
                  <div className="flex-1">
                    <Field label="Tags (comma separated)">
                      <Input value={data.meta.tags.join(', ')}
                        onChange={(e) => setMeta({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                        placeholder="React, TypeScript, Stripe" />
                      {data.meta.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {data.meta.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </Field>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                      <div className="flex rounded-md overflow-hidden border border-border">
                        <button type="button" onClick={() => setMeta({ status: 'published' })}
                          className={`px-3 py-2 text-sm font-medium transition-colors ${data.meta.status === 'published' ? 'bg-green-600 text-white' : 'bg-card text-muted-foreground hover:bg-accent'}`}>
                          Published
                        </button>
                        <button type="button" onClick={() => setMeta({ status: 'draft' })}
                          className={`px-3 py-2 text-sm font-medium border-l border-border transition-colors ${data.meta.status === 'draft' ? 'bg-yellow-600 text-white' : 'bg-card text-muted-foreground hover:bg-accent'}`}>
                          Draft
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Featured</Label>
                      <button type="button" onClick={() => setMeta({ featured: !data.meta.featured })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${data.meta.featured ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400' : 'border-border bg-card text-muted-foreground hover:bg-accent'}`}>
                        ⭐ {data.meta.featured ? 'Featured' : 'Not featured'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content split editor */}
            <div className={`grid gap-4 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-muted-foreground">Markdown</span>
                </div>
                <Textarea value={data.content} onChange={(e) => setData((d) => ({ ...d, content: e.target.value }))}
                  placeholder="Write the full project case study in Markdown..."
                  className="flex-1 min-h-[520px] font-mono text-sm rounded-none border-0 focus-visible:ring-0 resize-none" />
              </div>
              {showPreview && (
                <div className="border border-border rounded-lg overflow-hidden flex flex-col">
                  <div className="px-3 py-2 border-b border-border bg-muted/30">
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                  <div className="flex-1 p-4 overflow-auto min-h-[520px] prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                      img({ src, alt, ...rest }) {
                        const resolved = src && !src.startsWith('http') && !src.startsWith('/')
                          ? `/projects/${src}` : src;
                        return <img src={resolved} alt={alt} className="rounded-md max-w-full" {...rest} />;
                      },
                    }}>
                      {data.content || '*No content yet...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-end gap-2 pt-2 pb-8 border-t border-border mt-2">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
                {showPreview ? <><EyeOff className="w-4 h-4" />Hide Preview</> : <><Eye className="w-4 h-4" />Show Preview</>}
              </Button>
              <Button onClick={handleSave} disabled={saving || !data.meta.title || !data.meta.slug} className="gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save to GitHub</>}
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
