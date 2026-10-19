import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
      />
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-wide text-center">
          <p className="text-primary font-mono text-sm mb-4">// Error 404</p>
          <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
