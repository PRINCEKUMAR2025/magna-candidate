import Preloader from '@/components/common/Preloader';
import InfoRibbon from '@/components/common/InfoRibbon';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface LayoutProps {
  children: React.ReactNode;
  showRibbon?: boolean;
}

export default function Layout({ children, showRibbon = false }: LayoutProps) {
  return (
    <>
      <Preloader />
      {showRibbon && <InfoRibbon />}
      <Navbar />
      <main>{children}</main>
      <Footer />

      {/* Scroll-to-top button */}
      <a href="#" id="scrollUp" aria-label="Scroll to top">
        ↑
      </a>
    </>
  );
}
