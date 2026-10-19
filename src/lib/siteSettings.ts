import settingsData from '@/data/site-settings.json';

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteSettings {
  siteName: string;
  defaultTheme: 'dark' | 'light' | 'system';
  accentColor: string;
  siteUrl: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  ogImage: string;
  keywords: string;
  googleAnalyticsId: string;
  ctaText: string;
  ctaHref: string;
  nav: NavLink[];
  footer: {
    description: string;
    quickLinks: NavLink[];
    copyrightText: string;
  };
}

export const siteSettings: SiteSettings = settingsData as SiteSettings;
