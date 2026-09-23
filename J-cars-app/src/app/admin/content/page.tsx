import Link from "next/link";

import {
  addFaqItem,
  addTestimonial,
  deleteFaqItem,
  deleteTestimonial,
  moveFaqItem,
  updateAlertBanner,
  updateHero,
} from "@/actions/cms";
import { FlashMessage } from "@/components/admin/flash-message";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/roles";
import { getAdminCmsPages, getSetting } from "@/lib/settings/queries";
import { ALERT_TONES } from "@/lib/settings/schema";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border p-4" aria-labelledby={id}>
      <div>
        <h2 id={id} className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireRole(["admin"]);
  const { error, saved } = await searchParams;
  const [banner, hero, faq, testimonials, pages] = await Promise.all([
    getSetting("alert_banner"),
    getSetting("hero"),
    getSetting("faq"),
    getSetting("testimonials"),
    getAdminCmsPages(),
  ]);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Content</h1>
        <p className="text-sm text-muted-foreground">
          Everything here shows on the public site as soon as you save. Contact details and bank details are under{" "}
          <Link href="/admin/settings" className="text-primary hover:underline">Settings</Link>; featured vehicles and sale prices under{" "}
          <Link href="/admin/promotions" className="text-primary hover:underline">Promotions</Link>.
        </p>
      </div>
      <FlashMessage error={error} saved={saved} />

      <Section id="banner-heading" title="Alert banner" description="A strip at the top of every public page, e.g. holiday closures.">
        <form action={updateAlertBanner} className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox id="banner-enabled" name="enabled" defaultChecked={banner.enabled} />
            <Label htmlFor="banner-enabled" className="font-normal">Show the banner</Label>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="banner-message">Message</Label>
            <Input id="banner-message" name="message" defaultValue={banner.message} maxLength={300} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="banner-tone">Style</Label>
            <select id="banner-tone" name="tone" defaultValue={banner.tone} className={selectClassName}>
              {ALERT_TONES.map((tone) => (
                <option key={tone} value={tone} className="capitalize">{tone}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="banner-link-label">Link text (optional)</Label>
            <Input id="banner-link-label" name="linkLabel" defaultValue={banner.link_label} maxLength={60} />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="banner-link-url">Link (optional)</Label>
            <Input id="banner-link-url" name="linkUrl" defaultValue={banner.link_url} placeholder="/stock?promotion=1" />
          </div>
          <div>
            <Button type="submit" size="sm">Save banner</Button>
          </div>
        </form>
      </Section>

      <Section id="hero-heading" title="Home hero" description="The headline block at the top of the home page.">
        <form action={updateHero} className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="hero-title">Title</Label>
            <Input id="hero-title" name="title" defaultValue={hero.title} maxLength={120} required />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="hero-subtitle">Subtitle</Label>
            <Textarea id="hero-subtitle" name="subtitle" defaultValue={hero.subtitle} maxLength={300} rows={2} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="hero-cta-label">Button text</Label>
            <Input id="hero-cta-label" name="ctaLabel" defaultValue={hero.cta_label} maxLength={40} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="hero-cta-url">Button link</Label>
            <Input id="hero-cta-url" name="ctaUrl" defaultValue={hero.cta_url} placeholder="/stock" />
          </div>
          <div>
            <Button type="submit" size="sm">Save hero</Button>
          </div>
        </form>
      </Section>

      <Section id="faq-heading" title="FAQ" description="Shown on the home page.">
        {faq.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions yet.</p>
        ) : (
          <ol className="flex flex-col divide-y rounded-lg border">
            {faq.items.map((item, i) => (
              <li key={item.id} className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="text-sm">
                  <p className="font-medium">{item.question}</p>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <form action={moveFaqItem.bind(null, item.id, -1)}>
                    <Button type="submit" size="xs" variant="outline" disabled={i === 0} aria-label={`Move "${item.question}" up`}>↑</Button>
                  </form>
                  <form action={moveFaqItem.bind(null, item.id, 1)}>
                    <Button type="submit" size="xs" variant="outline" disabled={i === faq.items.length - 1} aria-label={`Move "${item.question}" down`}>↓</Button>
                  </form>
                  <form action={deleteFaqItem.bind(null, item.id)}>
                    <ConfirmSubmitButton type="submit" size="xs" variant="destructive" confirmMessage="Delete this question?">
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ol>
        )}
        <form action={addFaqItem} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="faq-question">New question</Label>
            <Input id="faq-question" name="question" maxLength={200} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="faq-answer">Answer</Label>
            <Textarea id="faq-answer" name="answer" maxLength={2000} rows={3} required />
          </div>
          <div>
            <Button type="submit" size="sm">Add question</Button>
          </div>
        </form>
      </Section>

      <Section id="testimonials-heading" title="Testimonials" description="Shown on the home page. Only publish reviews from real customers who agreed to it.">
        {testimonials.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No testimonials yet. The section stays hidden until you add one.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-lg border">
            {testimonials.items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="text-sm">
                  <p>“{item.quote}”</p>
                  <p className="text-muted-foreground">
                    {item.name}
                    {item.country && `, ${item.country}`}
                  </p>
                </div>
                <form action={deleteTestimonial.bind(null, item.id)}>
                  <ConfirmSubmitButton type="submit" size="xs" variant="destructive" confirmMessage="Delete this testimonial?">
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form action={addTestimonial} className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="t-name">Customer name</Label>
            <Input id="t-name" name="name" maxLength={80} required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="t-country">Country</Label>
            <Input id="t-country" name="country" maxLength={80} />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="t-quote">Quote</Label>
            <Textarea id="t-quote" name="quote" maxLength={600} rows={3} required />
          </div>
          <div>
            <Button type="submit" size="sm">Add testimonial</Button>
          </div>
        </form>
      </Section>

      <Section id="pages-heading" title="Pages">
        <ul className="flex flex-col divide-y rounded-lg border">
          {pages.map((page) => (
            <li key={page.slug} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                {page.title}
                <span className="font-mono text-xs text-muted-foreground">/{page.slug}</span>
                {!page.published && <Badge variant="outline">Hidden</Badge>}
              </span>
              <Button asChild size="xs" variant="outline">
                <Link href={`/admin/content/pages/${page.slug}`}>Edit</Link>
              </Button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
