import { Helmet } from 'react-helmet-async';
import { siteSettings } from '@/lib/siteSettings';
import { hexToHsl, isLightColor, shiftLightness } from '@/lib/colorUtils';

/**
 * Injects dynamic CSS variable overrides for the accent/primary color.
 * Works at runtime — no build step needed.
 */
export function ThemeConfig() {
  const { accentColor } = siteSettings;
  if (!accentColor) return null;

  const hsl = hexToHsl(accentColor);
  const light = isLightColor(accentColor);
  const fgHsl = light ? '20 14% 4%' : '0 0% 100%';

  // Dark mode: slightly brighter so it pops on dark backgrounds
  const darkHsl = shiftLightness(hsl, 8);
  // Light mode: slightly darker for better contrast on light backgrounds
  const lightHsl = shiftLightness(hsl, -5);

  const css = `
    :root {
      --primary: ${lightHsl};
      --ring: ${lightHsl};
      --primary-foreground: ${fgHsl};
      --sidebar-primary: ${lightHsl};
      --sidebar-ring: ${lightHsl};
    }
    .dark {
      --primary: ${darkHsl};
      --ring: ${darkHsl};
      --primary-foreground: ${fgHsl};
      --sidebar-primary: ${darkHsl};
      --sidebar-ring: ${darkHsl};
    }
  `;

  return <Helmet><style>{css}</style></Helmet>;
}
