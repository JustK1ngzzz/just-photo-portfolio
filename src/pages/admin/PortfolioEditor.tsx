import { useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getFile, updateFile } from '@/lib/github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import rawPortfolio from '@/data/portfolio.json';

type PortfolioJson = typeof rawPortfolio;

type Section = 'personal' | 'hero' | 'about' | 'services' | 'testimonials' | 'contact';

const SECTION_TITLES: Record<Section, string> = {
  personal: 'Personal Info',
  hero: 'Hero Section',
  about: 'About Section',
  services: 'Services',
  testimonials: 'Testimonials',
  contact: 'Contact',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ─── Section editors ──────────────────────────────────────────────────────────

function PersonalEditor({ data, onChange }: { data: PortfolioJson; onChange: (d: PortfolioJson) => void }) {
  const p = data.personal;
  const set = (patch: Partial<typeof p>) => onChange({ ...data, personal: { ...p, ...patch } });
  const setSocial = (patch: Partial<typeof p.social>) => set({ social: { ...p.social, ...patch } });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name"><Input value={p.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Title"><Input value={p.title} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Tagline"><Input value={p.tagline} onChange={(e) => set({ tagline: e.target.value })} /></Field>
        <Field label="Location"><Input value={p.location} onChange={(e) => set({ location: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" value={p.email} onChange={(e) => set({ email: e.target.value })} /></Field>
        <Field label="Phone"><Input value={p.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
        <Field label="Website"><Input value={p.website} onChange={(e) => set({ website: e.target.value })} /></Field>
      </div>
      <div className="pt-2 border-t border-border space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Social Links</p>
        <Field label="LinkedIn"><Input value={p.social.linkedin} onChange={(e) => setSocial({ linkedin: e.target.value })} /></Field>
        <Field label="GitHub"><Input value={p.social.github} onChange={(e) => setSocial({ github: e.target.value })} /></Field>
        <Field label="Twitter"><Input value={p.social.twitter} onChange={(e) => setSocial({ twitter: e.target.value })} /></Field>
      </div>
    </div>
  );
}

function HeroEditor({ data, onChange }: { data: PortfolioJson; onChange: (d: PortfolioJson) => void }) {
  const h = data.hero;
  const set = (patch: Partial<typeof h>) => onChange({ ...data, hero: { ...h, ...patch } });
  return (
    <div className="space-y-4">
      <Field label="Headline"><Input value={h.headline} onChange={(e) => set({ headline: e.target.value })} /></Field>
      <Field label="Highlighted Text"><Input value={h.highlightedText} onChange={(e) => set({ highlightedText: e.target.value })} /></Field>
      <Field label="Subheadline"><Textarea value={h.subheadline} rows={3} onChange={(e) => set({ subheadline: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary CTA"><Input value={h.primaryCta} onChange={(e) => set({ primaryCta: e.target.value })} /></Field>
        <Field label="Secondary CTA"><Input value={h.secondaryCta} onChange={(e) => set({ secondaryCta: e.target.value })} /></Field>
      </div>
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: PortfolioJson; onChange: (d: PortfolioJson) => void }) {
  const a = data.about;
  const set = (patch: Partial<typeof a>) => onChange({ ...data, about: { ...a, ...patch } });
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Paragraphs</p>
        {a.paragraphs.map((para, i) => (
          <div key={i} className="flex gap-2">
            <Textarea value={para} rows={3} className="flex-1" onChange={(e) => {
              const paragraphs = [...a.paragraphs]; paragraphs[i] = e.target.value; set({ paragraphs });
            }} />
            <Button type="button" variant="ghost" size="icon" className="shrink-0 hover:text-destructive mt-1"
              onClick={() => set({ paragraphs: a.paragraphs.filter((_, idx) => idx !== i) })}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm"
          onClick={() => set({ paragraphs: [...a.paragraphs, ''] })}>
          <Plus className="w-4 h-4 mr-2" />Add Paragraph
        </Button>
      </div>

      <div className="pt-2 border-t border-border space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Stats</p>
        <div className="grid grid-cols-2 gap-3">
          {a.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Value</Label>
                <Input value={stat.value} onChange={(e) => {
                  const stats = [...a.stats]; stats[i] = { ...stats[i], value: e.target.value }; set({ stats });
                }} />
              </div>
              <div className="space-y-1"><Label className="text-xs">Label</Label>
                <Input value={stat.label} onChange={(e) => {
                  const stats = [...a.stats]; stats[i] = { ...stats[i], label: e.target.value }; set({ stats });
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function ServicesEditor({ data, onChange }: { data: PortfolioJson; onChange: (d: PortfolioJson) => void }) {
  const items = data.services.items;
  const setItems = (next: typeof items) => onChange({ ...data, services: { ...data.services, items: next } });
  return (
    <div className="space-y-3">
      {items.map((service, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{service.title || `Service ${i + 1}`}</p>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title"><Input value={service.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; setItems(n); }} /></Field>
            <Field label="Icon (lucide name)"><Input value={service.icon} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], icon: e.target.value }; setItems(n); }} /></Field>
          </div>
          <Field label="Description"><Textarea value={service.description} rows={2} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; setItems(n); }} /></Field>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm"
        onClick={() => setItems([...items, { icon: 'Code', title: '', description: '' }])}>
        <Plus className="w-4 h-4 mr-2" />Add Service
      </Button>
    </div>
  );
}

function TestimonialsEditor({ data, onChange }: { data: PortfolioJson; onChange: (d: PortfolioJson) => void }) {
  const items = data.testimonials.items;
  const setItems = (next: typeof items) => onChange({ ...data, testimonials: { ...data.testimonials, items: next } });
  return (
    <div className="space-y-3">
      {items.map((t, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{t.author || `Testimonial ${i + 1}`}</p>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Author"><Input value={t.author} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], author: e.target.value }; setItems(n); }} /></Field>
            <Field label="Role"><Input value={t.role} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], role: e.target.value }; setItems(n); }} /></Field>
          </div>
          <Field label="Quote"><Textarea value={t.quote} rows={3} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], quote: e.target.value }; setItems(n); }} /></Field>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm"
        onClick={() => setItems([...items, { quote: '', author: '', role: '', avatar: '' }])}>
        <Plus className="w-4 h-4 mr-2" />Add Testimonial
      </Button>
    </div>
  );
}

function ContactEditor({ data, onChange }: { data: PortfolioJson; onChange: (d: PortfolioJson) => void }) {
  const c = data.contact;
  const set = (patch: Partial<typeof c>) => onChange({ ...data, contact: { ...c, ...patch } });
  return (
    <div className="space-y-4">
      <Field label="Section Title"><Input value={c.title} onChange={(e) => set({ title: e.target.value })} /></Field>
      <Field label="Subtitle"><Input value={c.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
      <Field label="CTA Button Text"><Input value={c.cta} onChange={(e) => set({ cta: e.target.value })} /></Field>
      <Field label="Availability"><Input value={c.availability} onChange={(e) => set({ availability: e.target.value })} /></Field>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PortfolioEditor() {
  const { section = 'personal' } = useParams<{ section: Section }>();
  const [data, setData] = useState<PortfolioJson>(JSON.parse(JSON.stringify(rawPortfolio)));
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { sha } = await getFile('src/data/portfolio.json');
      await updateFile(
        'src/data/portfolio.json',
        JSON.stringify(data, null, 2) + '\n',
        sha,
        `admin: update ${section}`
      );
      toast.success('Saved to GitHub');
    } catch (err) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }, [data, section]);

  if (!SECTION_TITLES[section as Section]) {
    return <Navigate to="/admin/portfolio/personal" replace />;
  }

  const SaveBar = () => (
    <div className="flex justify-end">
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save to GitHub</>}
      </Button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{SECTION_TITLES[section as Section]}</h1>
            <p className="text-muted-foreground text-sm mt-1">src/data/portfolio.json → {section}</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save to GitHub</>}
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          {section === 'personal'      && <PersonalEditor     data={data} onChange={setData} />}
          {section === 'hero'          && <HeroEditor         data={data} onChange={setData} />}
          {section === 'about'         && <AboutEditor        data={data} onChange={setData} />}
          {section === 'services'      && <ServicesEditor     data={data} onChange={setData} />}
          {section === 'testimonials'  && <TestimonialsEditor data={data} onChange={setData} />}
          {section === 'contact'       && <ContactEditor      data={data} onChange={setData} />}
        </div>

        <SaveBar />
      </div>
    </AdminLayout>
  );
}
