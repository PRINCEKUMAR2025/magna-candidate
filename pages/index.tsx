import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import StatsCounter from '@/components/home/StatsCounter';
import BrandsSlider from '@/components/home/BrandsSlider';
import SuperchargeSection from '@/components/home/SuperchargeSection';
import MagnaDifferenceSection from '@/components/home/MagnaDifferenceSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CtaStrip from '@/components/common/CtaStrip';

const CLIENT_IMAGES = Array.from({ length: 16 }, (_, i) => `/img/client-images/client-${i + 1}.webp`);

const TESTIMONIALS = [
  {
    quote:
      'I had been applying for months with no luck. Magna Hire matched me to a data engineering role at a Berlin startup within a week. The recruiter called me directly, the interview was already scheduled — I just had to show up and do my best.',
    name: 'Pramit Dash',
    title: 'Software Engineer',
    company: 'gridX',
    img: '/img/client-test/pramit-dash.jpg',
    linkedin: 'https://www.linkedin.com/in/pramitdash/',
  },
  {
    quote:
      "What surprised me was how relevant the role was to my exact skill set. I didn't apply — a recruiter from Magna Hire reached out to me through the platform. Two rounds later I had an offer. The AI matching genuinely works.",
    name: 'Sachin Fernando',
    title: 'Analytics Manager',
    company: 'Analitica',
    img: '/img/client-test/sachin.jpg',
    linkedin: 'https://www.linkedin.com/in/sachin-fernando-27b24552/',
  },
];

export default function Home() {
  return (
    <Layout showRibbon>
      <HeroSection />
      <StatsCounter />
      <BrandsSlider
        images={CLIENT_IMAGES}
        title="Companies actively hiring through Magna Hire"
      />
      <SuperchargeSection />
      <MagnaDifferenceSection />
      <TestimonialsSection testimonials={TESTIMONIALS} columns={2} />
      <CtaStrip
        heading="Your next job is already waiting. Let AI find it for you."
        buttonLabel="Browse Open Jobs"
        buttonHref="/jobs"
      />
    </Layout>
  );
}
