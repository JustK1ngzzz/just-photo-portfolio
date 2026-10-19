import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import portfolioData from '@/data/portfolio.json';

export function BlogSection() {
  const { blog } = portfolioData;

  return (
    <section id="blog" className="section-padding bg-card">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-primary font-mono text-sm mb-2">// Blog</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {blog.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {blog.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blog.posts.map((post, index) => (
            <Link
              key={index}
              to={`/blog/${post.slug}`}
              className="group p-6 rounded-xl bg-background border border-border card-shadow hover:border-primary/50 transition-all"
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
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-muted-foreground text-sm mb-4">
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

        {/* See More Link */}
        <div className="text-center mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            See all posts
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
