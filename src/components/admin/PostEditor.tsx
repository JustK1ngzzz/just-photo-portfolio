import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  cover: string;
  readTime: string;
  category: string;
  status: 'published' | 'draft';
  featured: boolean;
}

export interface PostData {
  frontmatter: PostFrontmatter;
  content: string;
}

interface PostEditorProps {
  data: PostData;
  isNew: boolean;
  showPreview: boolean;
  onChange: (data: PostData) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function PostEditor({ data, isNew, showPreview, onChange }: PostEditorProps) {
  function updateFrontmatter(field: keyof PostFrontmatter, value: string) {
    const updated = { ...data.frontmatter, [field]: value };
    if (isNew && field === 'title') {
      updated.slug = slugify(value);
    }
    onChange({ ...data, frontmatter: updated });
  }

  function updateContent(value: string) {
    onChange({ ...data, content: value });
  }

  return (
    <div className="space-y-4">
      {/* POST DETAILS card */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Post Details</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Title" required>
            <Input
              value={data.frontmatter.title}
              onChange={(e) => updateFrontmatter('title', e.target.value)}
              placeholder="Post title"
            />
          </Field>

          <Field label="Slug">
            <Input
              value={data.frontmatter.slug}
              readOnly={isNew}
              onChange={(e) => !isNew && updateFrontmatter('slug', e.target.value)}
              placeholder="post-slug"
              className={isNew ? 'bg-muted text-muted-foreground' : ''}
            />
          </Field>

          <Field label="Date">
            <Input
              type="date"
              value={data.frontmatter.date}
              onChange={(e) => updateFrontmatter('date', e.target.value)}
            />
          </Field>

          <Field label="Category">
            <Input
              value={data.frontmatter.category}
              onChange={(e) => updateFrontmatter('category', e.target.value)}
              placeholder="Engineering"
            />
          </Field>

          <Field label="Read Time">
            <Input
              value={data.frontmatter.readTime}
              onChange={(e) => updateFrontmatter('readTime', e.target.value)}
              placeholder="5 min read"
            />
          </Field>

          <Field label="Cover Image Path">
            <Input
              value={data.frontmatter.cover}
              onChange={(e) => updateFrontmatter('cover', e.target.value)}
              placeholder="/blog/images/cover.jpg"
            />
          </Field>

          <div className="col-span-2 flex items-end gap-6">
            <div className="flex-1">
              <Field label="Excerpt">
                <Input
                  value={data.frontmatter.excerpt}
                  onChange={(e) => updateFrontmatter('excerpt', e.target.value)}
                  placeholder="A short description of the post..."
                />
              </Field>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                <div className="flex rounded-md overflow-hidden border border-border">
                  <button
                    type="button"
                    onClick={() => updateFrontmatter('status', 'published')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      data.frontmatter.status === 'published'
                        ? 'bg-green-600 text-white'
                        : 'bg-card text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    Published
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFrontmatter('status', 'draft')}
                    className={`px-3 py-2 text-sm font-medium transition-colors border-l border-border ${
                      data.frontmatter.status === 'draft'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-card text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Featured</label>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, frontmatter: { ...data.frontmatter, featured: !data.frontmatter.featured } })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors w-full ${
                    data.frontmatter.featured
                      ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent'
                  }`}
                >
                  ⭐ {data.frontmatter.featured ? 'Featured' : 'Not featured'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor / Preview split */}
      <div className={`grid gap-4 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Markdown editor */}
        <div className="border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-muted-foreground">Markdown</span>
          </div>
          <Textarea
            value={data.content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Write your post content in Markdown..."
            className="flex-1 min-h-[520px] font-mono text-sm rounded-none border-0 focus-visible:ring-0 resize-none"
          />
        </div>

        {/* Preview pane */}
        {showPreview && (
          <div className="border border-border rounded-lg overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <span className="text-xs text-muted-foreground">Preview</span>
            </div>
            <div className="flex-1 p-4 overflow-auto min-h-[520px] prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img({ src, alt, ...rest }) {
                    // Rewrite relative image paths to absolute /blog/images/ paths
                    const resolved =
                      src && !src.startsWith('http') && !src.startsWith('/')
                        ? `/blog/${src}`
                        : src;
                    return <img src={resolved} alt={alt} className="rounded-md max-w-full" {...rest} />;
                  },
                }}
              >
                {data.content || '*No content yet...*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
