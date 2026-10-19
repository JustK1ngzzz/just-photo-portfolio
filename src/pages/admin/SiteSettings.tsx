import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getFile, updateFile, isGitHubConfigured } from '@/lib/github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Save, Globe, Navigation, AlignLeft } from 'lucide-react';
import type { SiteSettings, NavLink } from '@/lib/siteSettings';
import { siteSettings as defaultSettings } from '@/lib/siteSettings';

type Tab = 'general' | 'nav' | 'footer';

function LinkRow({
  link,
  onChange,
  onRemove,
}: {
  link: NavLink;
  onChange: (updated: NavLink) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={link.label}
        onChange={(e) => onChange({ ...link, label: e.target.value })}
        placeholder="Label"
        className="flex-1"
      />
      <Input
        value={link.href}
        onChange={(e) => onChange({ ...link, href: e.target.value })}
        placeholder="/path or /#hash"
        className="flex-1"
      />
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:text-destructive" onClick={onRemove}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('general');

  useEffect(() => {
    getFile('src/data/site-settings.json')
      .then(({ content }) => {
        setSettings(JSON.parse(content));
      })
      .catch(() => {
        // fallback to static import already in state
      })
      .finally(() => setLoading(false));
  }, []);

  function setField<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function setFooterField<K extends keyof SiteSettings['footer']>(
    key: K,
    value: SiteSettings['footer'][K]
  ) {
    setSettings((prev) => ({ ...prev, footer: { ...prev.footer, [key]: value } }));
  }

  async function handleSave() {
    if (!isGitHubConfigured()) {
      toast.error('GitHub is not configured — set VITE_GITHUB_TOKEN in .env.local');
      return;
    }
    setSaving(true);
    try {
      const { sha } = await getFile('src/data/site-settings.json');
      await updateFile(
        'src/data/site-settings.json',
        JSON.stringify(settings, null, 2) + '\n',
        sha,
        'admin: update site settings'
      );
      toast.success('Site settings saved — deploy to apply changes');
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
    { key: 'nav', label: 'Navigation', icon: <Navigation className="w-4 h-4" /> },
    { key: 'footer', label: 'Footer', icon: <AlignLeft className="w-4 h-4" /> },
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Site Settings</h1>
            <p className="text-muted-foreground mt-1">
              Logo, favicon, navigation, footer, SEO defaults
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading settings...
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
              {tabs.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    tab === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* General */}
            {tab === 'general' && (
              <div className="space-y-5">
                <Section title="Branding">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Default Theme">
                      <select
                        value={settings.defaultTheme}
                        onChange={(e) => setField('defaultTheme', e.target.value as SiteSettings['defaultTheme'])}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                      </select>
                    </Field>
                    <Field label="Accent Color" hint="Brand color used across the site and OG images">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.accentColor || '#6366f1'}
                          onChange={(e) => setField('accentColor', e.target.value)}
                          className="h-9 w-14 rounded-md border border-input bg-background cursor-pointer p-1"
                        />
                        <Input
                          value={settings.accentColor || ''}
                          onChange={(e) => setField('accentColor', e.target.value)}
                          placeholder="#6366f1"
                          className="flex-1 font-mono"
                        />
                        <div
                          className="w-8 h-8 rounded-full shrink-0 border border-border"
                          style={{ backgroundColor: settings.accentColor || '#6366f1' }}
                        />
                      </div>
                    </Field>
                  </div>
                  <Field label="Site Name">
                    <Input value={settings.siteName} onChange={(e) => setField('siteName', e.target.value)} />
                  </Field>
                  <Field label="Site URL" hint="Used for canonical links and OG tags">
                    <Input value={settings.siteUrl} onChange={(e) => setField('siteUrl', e.target.value)} />
                  </Field>
                  <Field label="Logo Path" hint="Relative path e.g. /logo.jpg or full URL">
                    <div className="flex items-center gap-3">
                      <Input
                        value={settings.logo}
                        onChange={(e) => setField('logo', e.target.value)}
                        className="flex-1"
                      />
                      {settings.logo && (
                        <img src={settings.logo} alt="logo preview" className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                      )}
                    </div>
                  </Field>
                  <Field label="Favicon Path" hint="Shown in browser tab — relative path or URL">
                    <div className="flex items-center gap-3">
                      <Input
                        value={settings.favicon}
                        onChange={(e) => setField('favicon', e.target.value)}
                        className="flex-1"
                      />
                      {settings.favicon && (
                        <img src={settings.favicon} alt="favicon preview" className="w-8 h-8 rounded object-cover border border-border shrink-0" />
                      )}
                    </div>
                  </Field>
                </Section>

                <Section title="SEO Defaults">
                  <Field label="Default Description">
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setField('siteDescription', e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </Field>
                  <Field label="Default OG Image" hint="Shown when sharing on social — relative path or URL">
                    <div className="flex items-center gap-3">
                      <Input
                        value={settings.ogImage}
                        onChange={(e) => setField('ogImage', e.target.value)}
                        className="flex-1"
                      />
                      {settings.ogImage && (
                        <img src={settings.ogImage} alt="OG preview" className="w-16 h-10 rounded object-cover border border-border shrink-0" />
                      )}
                    </div>
                  </Field>
                  <Field label="Keywords" hint="Comma-separated meta keywords">
                    <Input value={settings.keywords} onChange={(e) => setField('keywords', e.target.value)} />
                  </Field>
                </Section>

                <Section title="Analytics">
                  <Field label="Google Analytics ID" hint="e.g. G-XXXXXXXXXX — leave empty to disable">
                    <Input
                      value={settings.googleAnalyticsId}
                      onChange={(e) => setField('googleAnalyticsId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </Field>
                </Section>
              </div>
            )}

            {/* Navigation */}
            {tab === 'nav' && (
              <div className="space-y-5">
                <Section title="CTA Button">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Button Text">
                      <Input value={settings.ctaText} onChange={(e) => setField('ctaText', e.target.value)} />
                    </Field>
                    <Field label="Button Link">
                      <Input value={settings.ctaHref} onChange={(e) => setField('ctaHref', e.target.value)} placeholder="/#contact" />
                    </Field>
                  </div>
                </Section>

                <Section title="Nav Links">
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_36px] gap-2 px-1">
                      <span className="text-xs text-muted-foreground font-medium">Label</span>
                      <span className="text-xs text-muted-foreground font-medium">Link</span>
                      <span />
                    </div>
                    {settings.nav.map((link, i) => (
                      <LinkRow
                        key={i}
                        link={link}
                        onChange={(updated) =>
                          setField('nav', settings.nav.map((l, idx) => (idx === i ? updated : l)))
                        }
                        onRemove={() => setField('nav', settings.nav.filter((_, idx) => idx !== i))}
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => setField('nav', [...settings.nav, { label: '', href: '' }])}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Link
                    </Button>
                  </div>
                </Section>
              </div>
            )}

            {/* Footer */}
            {tab === 'footer' && (
              <div className="space-y-5">
                <Section title="Footer Content">
                  <Field label="Footer Description">
                    <textarea
                      value={settings.footer.description}
                      onChange={(e) => setFooterField('description', e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </Field>
                  <Field label="Copyright Text" hint={`© ${new Date().getFullYear()} {Site Name}. [your text here]`}>
                    <Input
                      value={settings.footer.copyrightText}
                      onChange={(e) => setFooterField('copyrightText', e.target.value)}
                      placeholder="All rights reserved."
                    />
                  </Field>
                </Section>

                <Section title="Quick Links">
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_36px] gap-2 px-1">
                      <span className="text-xs text-muted-foreground font-medium">Label</span>
                      <span className="text-xs text-muted-foreground font-medium">Link</span>
                      <span />
                    </div>
                    {settings.footer.quickLinks.map((link, i) => (
                      <LinkRow
                        key={i}
                        link={link}
                        onChange={(updated) =>
                          setFooterField('quickLinks', settings.footer.quickLinks.map((l, idx) => (idx === i ? updated : l)))
                        }
                        onRemove={() =>
                          setFooterField('quickLinks', settings.footer.quickLinks.filter((_, idx) => idx !== i))
                        }
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => setFooterField('quickLinks', [...settings.footer.quickLinks, { label: '', href: '' }])}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Link
                    </Button>
                  </div>
                </Section>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
