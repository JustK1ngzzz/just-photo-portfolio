import { Helmet } from 'react-helmet-async';
import { siteSettings } from '@/lib/siteSettings';
import portfolioData from '@/data/portfolio.json';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
}

export function SEO({
  title,
  description,
  image,
  url = '',
  type = 'website',
  publishedTime,
  author = siteSettings.siteName,
}: SEOProps) {
  const { siteName, siteUrl, siteDescription, ogImage, favicon, keywords, googleAnalyticsId } = siteSettings;

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || siteDescription;
  const fullUrl = `${siteUrl}${url}`;

  // Use dynamic /api/og when ogImage is empty (works locally via Vite plugin, in prod via Edge Function)
  const resolvedImage = image || ogImage;
  const ogParams = new URLSearchParams({
    title: fullTitle,
    description: fullDescription,
    type,
    name: siteName,
    role: portfolioData.personal.title,
    site: siteUrl.replace(/^https?:\/\//, ''),
    accent: siteSettings.accentColor || '#6366f1',
  });
  const dynamicOg = `${siteUrl}/api/og?${ogParams.toString()}`;
  const fullImage = resolvedImage
    ? (resolvedImage.startsWith('http') ? resolvedImage : `${siteUrl}${resolvedImage}`)
    : dynamicOg;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="author" content={author} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Favicon (dynamic) */}
      <link rel="icon" type="image/png" href={favicon} />
      <link rel="apple-touch-icon" href={favicon} />

      {/* Google Analytics */}
      {googleAnalyticsId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Article */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
}
