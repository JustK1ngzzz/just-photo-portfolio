import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import portfolioData from '@/data/portfolio.json';

const PROJECTS_PER_PAGE = 6;

export default function Projects() {
  const { projects } = portfolioData;
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects.items;
    const query = searchQuery.toLowerCase();
    return projects.items.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [projects.items, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Projects"
        description="Featured projects and case studies showcasing my work in Shopify development, SaaS applications, and custom web solutions."
        url="/projects"
      />
      <Header />

      {/* Content */}
      <main className="pt-32 pb-20">
        <div className="container-wide">
          {/* Page Header */}
          <div className="mb-12">
            <p className="text-primary font-mono text-sm mb-2">// Projects</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {projects.title}
              </h1>
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {projects.subtitle}
            </p>
          </div>

          {/* Results count */}
          {searchQuery && (
            <p className="text-sm text-muted-foreground mb-6">
              Found {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} matching "{searchQuery}"
            </p>
          )}

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {paginatedProjects.map((project, index) => (
              <Link
                key={index}
                to={`/projects/${project.slug}`}
                className="group p-6 rounded-xl bg-card border border-border card-shadow hover:border-primary/50 transition-all"
              >
                {/* Year, Category & Metrics */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {project.year}
                    </span>
                    {'category' in project && (project as any).category && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                        {(project as any).category}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-primary font-medium">
                    {project.metrics}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {project.title}
                </h2>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-4">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* View Project */}
                <span className="inline-flex items-center text-sm text-primary font-medium group-hover:underline">
                  View details
                  <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No projects found matching your search.</p>
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
