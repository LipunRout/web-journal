import Link from 'next/link';
import { Github, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { Logo } from './Logo';

const SITE = {
  about: 'Articles on frontend, backend, cloud and AI, written by the people building them.',
  email: 'hello@yourdomain.com',
  phone: '+91 00000 00000',
  location: 'Kolkata, India',
  socials: [
    { label: 'GitHub', href: 'https://github.com/your-name', Icon: Github },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/your-name', Icon: Linkedin },
    { label: 'Twitter', href: 'https://twitter.com/your-name', Icon: Twitter },
  ],
};

const linkClass = 'text-footer-foreground/70 transition-colors hover:text-footer-foreground';

export function Footer() {
  return (
    <footer className="mt-24 bg-footer text-footer-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-6 text-footer-foreground/70">{SITE.about}</p>
          <ul className="mt-5 flex gap-2">
            {SITE.socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg bg-footer-foreground/10 transition-colors hover:bg-footer-foreground/20"
                >
                  <Icon size={16} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Categories">
          <h2 className="text-sm font-semibold">Categories</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className={linkClass}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Site">
          <h2 className="text-sm font-semibold">Site</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/" className={linkClass}>Home</Link></li>
            <li><Link href="/blog" className={linkClass}>All posts</Link></li>
            <li><Link href="/admin/posts/new" className={linkClass}>Write a post</Link></li>
            <li><Link href="/admin" className={linkClass}>Dashboard</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Mail size={16} aria-hidden className="shrink-0 text-footer-foreground/60" />
              <a href={`mailto:${SITE.email}`} className={linkClass}>{SITE.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} aria-hidden className="shrink-0 text-footer-foreground/60" />
              <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className={linkClass}>{SITE.phone}</a>
            </li>
            <li className="flex items-center gap-3 text-footer-foreground/70">
              <MapPin size={16} aria-hidden className="shrink-0 text-footer-foreground/60" />
              {SITE.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-footer-foreground/15">
        <p className="container-page py-6 text-sm text-footer-foreground/60">
          &copy; {new Date().getFullYear()} Web Journal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}