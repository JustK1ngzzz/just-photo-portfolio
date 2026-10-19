import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PostEditor, PostData } from '@/components/admin/PostEditor';
import { getFile, updateFile, createFile, getPortfolioJson } from '@/lib/github';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import portfolioData from '@/data/portfolio.json';

const today = new Date().toISOString().split('T')[0];

const emptyPost: PostData = {
  frontmatter: {
    title: '',
    slug: '',
    date: today,
    excerpt: '',
    cover: '/blog/images/',
    readTime: '5 min read',
    category: 'Engineering',
    status: 'published',
    featured: false,
  },
  content: '',
};

function parseFrontmatter(raw: string): PostData {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { ...emptyPost, content: raw };

  const fm: Record<string, string> = {};
  match[1].split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      fm[key] = value;
    }
  });

  return {
    frontmatter: {
      title: fm.title || '',
      slug: fm.slug || '',
      date: fm.date || today,
      excerpt: fm.excerpt || '',
      cover: fm.cover || '/blog/images/',
      readTime: fm.readTime || '5 min read',
      category: fm.category || 'Engineering',
      status: (fm.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft',
      featured: fm.featured === 'true',
    },
    content: match[2].trim(),
  };
}

function buildMarkdown(data: PostData): string {
  const { title, slug, date, excerpt, cover, readTime, category, status, featured } = data.frontmatter;
  return `---
title: "${title}"
slug: "${slug}"
date: "${date}"
excerpt: "${excerpt}"
cover: "${cover}"
readTime: "${readTime}"
category: "${category}"
status: "${status}"
featured: "${featured}"
---

${data.content}
`;
}

export default function BlogEditor() {
  const { slug } = useParams<{ slug: string }>();
  const isNew = !slug || slug === 'new';
  const navigate = useNavigate();

  const [postData, setPostData] = useState<PostData>(emptyPost);
  const [fileSha, setFileSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (isNew) return;

    async function loadPost() {
      let localContent = '';
      let hasFrontmatter = false;

      // Step 1: try to load local file content
      try {
        const res = await fetch(`/blog/${slug}.md`);
        if (!res.ok) throw new Error('not found');
        const raw = await res.text();
        const parsed = parseFrontmatter(raw);

        if (parsed.frontmatter.title) {
          // File has frontmatter (admin-created post) — use it directly
          hasFrontmatter = true;
          setPostData(parsed);
        } else {
          // Old post: no frontmatter, but content is there
          localContent = parsed.content;
        }
      } catch {
        // File doesn't exist yet — content stays empty
      }

      // Step 2: if no frontmatter, merge portfolio.json metadata (from GitHub) with local content
      if (!hasFrontmatter) {
        let post: Record<string, unknown> | undefined;
        try {
          const full = await getPortfolioJson() as { blog: { posts: Record<string, unknown>[] } };
          post = full.blog.posts.find((p) => p.slug === slug);
        } catch {
          post = portfolioData.blog.posts.find((p) => p.slug === slug) as Record<string, unknown>;
        }
        setPostData({
          frontmatter: {
            title: (post?.title as string) || '',
            slug: (post?.slug as string) || slug || '',
            date: (post?.date as string) || today,
            excerpt: (post?.excerpt as string) || '',
            cover: (post?.cover as string) || '/blog/images/',
            readTime: (post?.readTime as string) || '5 min read',
            category: (post?.category as string) || 'Engineering',
            status: (post?.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft',
            featured: !!(post?.featured),
          },
          content: localContent,
        });
      }

      // Step 3: fetch SHA from GitHub API for future commits (non-blocking)
      try {
        const { sha } = await getFile(`public/blog/${slug}.md`);
        setFileSha(sha);
      } catch {
        // SHA not available — save will create the file instead of updating
      }

      setLoading(false);
    }

    loadPost();
  }, [slug, isNew]);

  async function handleSave() {
    if (!postData.frontmatter.title || !postData.frontmatter.slug) return;

    setSaving(true);
    try {
      const mdContent = buildMarkdown(postData);
      const mdPath = `public/blog/${postData.frontmatter.slug}.md`;

      if (fileSha) {
        await updateFile(mdPath, mdContent, fileSha, `admin: update blog post "${postData.frontmatter.slug}"`);
      } else {
        await createFile(mdPath, mdContent, `admin: create blog post "${postData.frontmatter.slug}"`);
      }

      const postMeta = {
        title: postData.frontmatter.title,
        excerpt: postData.frontmatter.excerpt,
        date: postData.frontmatter.date,
        readTime: postData.frontmatter.readTime,
        slug: postData.frontmatter.slug,
        cover: postData.frontmatter.cover,
        status: postData.frontmatter.status,
        featured: postData.frontmatter.featured,
      };

      // Always update blog-index.json (full index)
      const { content: idxRaw, sha: idxSha } = await getFile('public/blog-index.json');
      const idx = JSON.parse(idxRaw);
      const idxPos = idx.findIndex((p: { slug: string }) => p.slug === postData.frontmatter.slug);
      if (idxPos >= 0) {
        idx[idxPos] = postMeta;
      } else {
        idx.unshift(postMeta);
      }
      await updateFile('public/blog-index.json', JSON.stringify(idx, null, 2) + '\n', idxSha,
        `admin: update blog index "${postData.frontmatter.slug}"`);

      // Update portfolio.json — only keep featured posts there
      const { content: rawJson, sha: jsonSha } = await getFile('src/data/portfolio.json');
      const portfolioJson = JSON.parse(rawJson);
      if (postData.frontmatter.featured) {
        const existingIdx = portfolioJson.blog.posts.findIndex(
          (p: { slug: string }) => p.slug === postData.frontmatter.slug
        );
        if (existingIdx >= 0) {
          portfolioJson.blog.posts[existingIdx] = postMeta;
        } else {
          portfolioJson.blog.posts.unshift(postMeta);
        }
      } else {
        // Remove from featured list if it was there before
        portfolioJson.blog.posts = portfolioJson.blog.posts.filter(
          (p: { slug: string }) => p.slug !== postData.frontmatter.slug
        );
      }
      await updateFile(
        'src/data/portfolio.json',
        JSON.stringify(portfolioJson, null, 2) + '\n',
        jsonSha,
        `admin: update featured posts "${postData.frontmatter.slug}"`
      );

      toast.success('Post saved to GitHub');

      if (isNew) {
        navigate(`/admin/blog/${postData.frontmatter.slug}`);
      } else {
        try {
          const { sha } = await getFile(mdPath);
          setFileSha(sha);
        } catch {
          // ignore
        }
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
            <Link to="/admin/blog">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isNew ? 'New Post' : 'Edit Post'}
              </h1>
              {!isNew && slug && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Editing public/blog/{slug}.md
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isNew && postData.frontmatter.slug && (
              <a href={`/blog/${postData.frontmatter.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="gap-2">
                  <ExternalLink className="w-4 h-4" />View Post
                </Button>
              </a>
            )}
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              {showPreview ? <><EyeOff className="w-4 h-4" />Hide Preview</> : <><Eye className="w-4 h-4" />Show Preview</>}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !postData.frontmatter.title || !postData.frontmatter.slug}
              className="gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save to GitHub</>}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading post...
          </div>
        ) : (
          <>
            <PostEditor
              data={postData}
              isNew={isNew}
              showPreview={showPreview}
              onChange={setPostData}
            />

            {/* Bottom action bar */}
            <div className="flex items-center justify-end gap-2 pt-2 pb-8 border-t border-border mt-2">
              {!isNew && postData.frontmatter.slug && (
                <a href={`/blog/${postData.frontmatter.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" className="gap-2">
                    <ExternalLink className="w-4 h-4" />View Post
                  </Button>
                </a>
              )}
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? <><EyeOff className="w-4 h-4" />Hide Preview</> : <><Eye className="w-4 h-4" />Show Preview</>}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !postData.frontmatter.title || !postData.frontmatter.slug}
                className="gap-2"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save to GitHub</>}
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
