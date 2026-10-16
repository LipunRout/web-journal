'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import SculptureHero from '@/components/ui/liquid-sculpture-hero';

const HEIGHT = 'calc(100svh - 4rem)'; // viewport minus the 4rem header

export function HomeHero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Placeholder until the theme is known, so dark-mode users never see a light flash.
  if (!mounted) {
    return <div aria-hidden style={{ height: HEIGHT, background: 'hsl(var(--background))' }} />;
  }

  return (
    <SculptureHero
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      themeToggle={false}
      showNav={false}
      height={HEIGHT}
      background="#F9F8FC"
      darkBackground="#0D0A15"
      textColor="hsl(var(--foreground))"
      accentColor="hsl(var(--primary))"
      headingFont="var(--font-sans), ui-sans-serif, system-ui, sans-serif"
      accentFont="var(--font-serif), ui-serif, Georgia, serif"
      bodyFont="var(--font-sans), ui-sans-serif, system-ui, sans-serif"
      loadFonts={false}
      eyebrow="A blog for web developers"
      headline={'Write about the web.\nPublish in minutes.'}
      headlineAccent="Publish in minutes."
      body="Sign in with Google, write in Markdown and your post goes live on a fast, readable page."
      primaryCta={{ label: 'Start writing', href: '/admin/posts/new' }}
      secondaryCta={{ label: 'Read the blog', href: '/blog' }}
      backdropText="journal"
      hint="Move across the form"
    />
  );
}