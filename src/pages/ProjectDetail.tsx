import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import portfolioData from '@/data/portfolio.json';
import { siteSettings } from '@/lib/siteSettings';

interface ProjectMeta {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  metrics: string;
  year: string;
  category: string;
  liveUrl?: string;
  cover?: string;
  featured?: boolean;
  status?: string;
}

function stripFrontmatter(text: string): string {
  return text.replace(/^---[\s\S]*?---\s*\n?/, '');
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<string>('');
  const [project, setProject] = useState<ProjectMeta | null>(
    (portfolioData.projects.items.find((p) => p.slug === slug) as ProjectMeta) ?? null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Fetch project metadata from index if not already found in portfolio.json
    if (!project) {
      fetch('/projects-index.json')
        .then((r) => r.ok ? r.json() : [])
        .then((data: ProjectMeta[]) => {
          const found = data.find((p) => p.slug === slug);
          if (found) setProject(found);
        })
        .catch(() => {});
    }

    fetch(`/projects/${slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then((text) => {
        setContent(stripFrontmatter(text));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  // Still fetching metadata for non-featured projects
  if (!project && loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container-wide max-w-4xl mx-auto px-4 animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show "not found" only after content fetch is done and project is still null
  if (!project && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Project Not Found" url={`/projects/${slug}`} />
        <Header />
        <main className="pt-32 pb-20">
          <div className="container-wide text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The project you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/projects">Back to Projects</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={project.title}
        description={project.description}
        image={project.cover}
        url={`/projects/${project.slug}`}
      />
      <Header />

      {/* Content */}
      <main className="pt-32 pb-20">
        <article className="container-wide max-w-4xl mx-auto px-4">
          {/* Back Link */}
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          {/* Project Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {project.year}
              </span>
              <span className="text-primary font-medium">
                {project.metrics}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {project.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Live Site Link */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Live Site
              </a>
            )}
          </header>

          {/* Project Content */}
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">
                Detailed case study coming soon.
              </p>
              <Button asChild variant="outline">
                <Link to="/projects">Back to Projects</Link>
              </Button>
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-img:rounded-lg prose-img:shadow-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  img: ({ src, alt }) => {
                    let imageSrc = src || '';
                    if (imageSrc.startsWith('/')) {
                      // absolute path from public root — use as-is
                    } else if (!imageSrc.startsWith('http')) {
                      // Handle paths like "images/file.jpg" or just "file.jpg"
                      imageSrc = imageSrc.startsWith('images/')
                        ? `/projects/${imageSrc}`
                        : `/projects/images/${imageSrc}`;
                    }
                    return (
                      <img
                        src={imageSrc}
                        alt={alt || ''}
                        className="rounded-lg shadow-lg w-full"
                        loading="lazy"
                      />
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {/* Project Footer */}
          <footer className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={siteSettings.logo}
                  alt={siteSettings.siteName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">
                    {portfolioData.personal.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {portfolioData.personal.title}
                  </p>
                </div>
              </div>
              <Button asChild>
                <a href="/#contact">
                  Discuss a similar project
                </a>
              </Button>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}
