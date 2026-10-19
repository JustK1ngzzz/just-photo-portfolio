import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import portfolioData from '@/data/portfolio.json';

interface BlogPost {
  title: string;
  slug: string;
  date: string;
  readTime: string;
  excerpt: string;
  cover?: string;
  status?: string;
  featured?: boolean;
}

const POSTS_PER_PAGE = 9;

export default function Blog() {
  const { blog } = portfolioData;
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/blog-index.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load blog index');
        return res.json();
      })
      .then((data: BlogPost[]) => setAllPosts(data))
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
  }, []);

  // Only show published posts (treat missing status as published for backward compatibility)
  const publishedPosts = useMemo(
    () => allPosts.filter((post) => post.status !== 'draft'),
    [allPosts]
  );

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return publishedPosts;
    const query = searchQuery.toLowerCase();
    return publishedPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)
    );
  }, [publishedPosts, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog"
        description="Thoughts on software engineering, building products, and lessons learned from working with clients worldwide."
        url="/blog"
      />
      <Header />

      {/* Content */}
      <main className="pt-32 pb-20">
        <div className="container-wide">
          {/* Page Header */}
          <div className="mb-12">
            <p className="text-primary font-mono text-sm mb-2">// Blog</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {blog.title}
              </h1>
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {blog.subtitle}
            </p>
          </div>

          {/* Results count */}
          {searchQuery && (
            <p className="text-sm text-muted-foreground mb-6">
              Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} matching "{searchQuery}"
            </p>
          )}

          {/* Loading state */}
          {loadingPosts && (
            <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
          )}

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post, index) => (
              <Link
                key={index}
                to={`/blog/${post.slug}`}
                className="group p-6 rounded-xl bg-card border border-border card-shadow hover:border-primary/50 transition-all"
              >
                {/* Date & Read Time */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Read More */}
                <span className="inline-flex items-center text-sm text-primary font-medium group-hover:underline">
                  Read more
                  <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {!loadingPosts && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No posts found matching your search.</p>
              <button
                onClick={() => handleSearch('')}
                className="mt-4 text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-card hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg border transition-all ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-card hover:border-primary/50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-card hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
