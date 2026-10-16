import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="min-h-[60vh]">{children}</div>
      <Footer />
    </>
  );
}
