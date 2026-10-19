import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "./components/ScrollToTop";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import BlogList from "./pages/admin/BlogList";
import BlogEditor from "./pages/admin/BlogEditor";
import PortfolioEditor from "./pages/admin/PortfolioEditor";
import ProjectList from "./pages/admin/ProjectList";
import ProjectEditor from "./pages/admin/ProjectEditor";
import SiteSettingsPage from "./pages/admin/SiteSettings";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { ThemeConfig } from "./components/ThemeConfig";
import { siteSettings } from "@/lib/siteSettings";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme={siteSettings.defaultTheme}>
        <ThemeConfig />
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />

            {/* Admin routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/blog" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
            <Route path="/admin/blog/new" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
            <Route path="/admin/blog/:slug" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
            <Route path="/admin/projects/new" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
            <Route path="/admin/projects/:slug" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><SiteSettingsPage /></ProtectedRoute>} />
            <Route path="/admin/portfolio" element={<Navigate to="/admin/portfolio/personal" replace />} />
            <Route path="/admin/portfolio/:section" element={<ProtectedRoute><PortfolioEditor /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
