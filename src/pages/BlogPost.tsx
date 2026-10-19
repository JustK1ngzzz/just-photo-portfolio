import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import portfolioData from '@/data/portfolio.json';
import { siteSettings } from '@/lib/siteSettings';

interface BlogPostMeta {
  title: string;
  slug: string;
  date: string;
  readTime: string;
  excerpt: string;
  cover: string;
  status?: string;
  featured?: boolean;
}

function stripFrontmatter(text: string): string {
  return text.replace(/^---[\s\S]*?---\s*\n?/, '');
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<string>('');
  const [post, setPost] = useState<BlogPostMeta | null>(
    (portfolioData.blog.posts.find((p) => p.slug === slug) as BlogPostMeta) ?? null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Fetch post metadata from index if not found in portfolio.json (non-featured posts)
    if (!post) {
      fetch('/blog-index.json')
        .then((r) => r.ok ? r.json() : [])
        .then((data: BlogPostMeta[]) => {
          const found = data.find((p) => p.slug === slug);
          if (found) setPost(found);
        })
        .catch(() => {});
    }

    fetch(`/blog/${slug}.md`)
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

  // Still fetching metadata for non-featured posts
  if (!post && loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container-wide max-w-3xl mx-auto px-4 animate-pulse space-y-4">
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

  // Show "not found" only after content fetch is done and post is still null
  if (!post && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Post Not Found" url={`/blog/${slug}`} />
        <Header />
        <main className="pt-32 pb-20">
          <div className="container-wide text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
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
        title={post.title}
        description={post.excerpt}
        image={post.cover}
        url={`/blog/${post.slug}`}
        type="article"
        publishedTime={post.date}
      />
      <Header />

      {/* Content */}
      <main className="pt-32 pb-20">
        <article className="container-wide max-w-3xl mx-auto px-4">
          {/* Back Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Post Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </header>

          {/* Post Content */}
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Content not available yet.
              </p>
              <Button asChild variant="outline">
                <Link to="/blog">Back to Blog</Link>
              </Button>
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-img:rounded-lg prose-img:shadow-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  a: ({ href, children, ...props }) => {
                    const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
                    return (
                      <a
                        href={href}
                        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  img: ({ src, alt }) => {
                    let imageSrc = src || '';
                    if (!imageSrc.startsWith('http')) {
                      // Handle paths like "images/file.jpg" or just "file.jpg"
                      imageSrc = imageSrc.startsWith('images/')
                        ? `/blog/${imageSrc}`
                        : `/blog/images/${imageSrc}`;
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

          {/* Post Footer */}
          <footer className="mt-16 pt-8 border-t border-border">
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
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}
