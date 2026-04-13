import Image from 'next/image';
import Link from 'next/link';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  img: string;
  linkedin: string;
}

interface Props {
  testimonials: Testimonial[];
  columns?: 2 | 3;
}

const QuoteIcon = () => (
  <svg className="w-8 text-magna opacity-25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor">
    <path d="M557.133 561.704H442.128c-44.256 0-80.458-36.19-80.458-80.446 0-165.58-42.32-347.485 160.656-399.418 91.95-23.516 115.915 77.753 18.119 84.745-59.647 4.276-71.293 42.804-73.147 101.068h92.269c44.256 0 80.458 36.201 80.458 80.458v130.702c0 45.591-37.3 82.89-82.891 82.89zm-358.032 0H84.096c-44.256 0-80.446-36.19-80.446-80.446 0-165.58-42.331-347.485 160.644-399.418 91.95-23.516 115.915 77.753 18.118 84.745-59.646 4.276-71.292 42.804-73.146 101.068h92.269c44.256 0 80.457 36.201 80.457 80.458v130.702c0 45.591-37.3 82.89-82.89 82.89z" />
  </svg>
);

export default function TestimonialsSection({ testimonials, columns = 2 }: Props) {
  const gridClass = columns === 3 ? 'grid-cols-3 max-md:grid-cols-1' : 'grid-cols-2 max-md:grid-cols-1';

  return (
    <section className="my-10">
      <div className="relative container px-8 py-16 mx-auto bg-gray shadow-lg md:px-12 lg:px-16 xl:px-32 sm:rounded-lg overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-56 hero-pattern" />
        <div>
          <h2 className="text-4xl font-bold text-center text-gray-800">
            Real candidates. Real placements.
          </h2>
          <div className="w-12 h-2 mx-auto my-4 border-4 border-magna" />
          <p className="text-xl text-center text-gray-700">Hear it from people who landed their jobs through Magna Hire</p>
        </div>

        <div className={`grid gap-4 ${gridClass}`}>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative flex flex-col justify-between max-w-sm p-10 mx-auto mt-8 leading-snug text-gray-700 bg-white rounded-lg shadow"
            >
              <div className="-ml-4">
                <QuoteIcon />
              </div>
              <p className="mt-2">{t.quote}</p>
              <div>
                <div className="w-full mx-auto my-8 border border-gray-300" />
                <div className="flex items-center">
                  <Link href={t.linkedin} target="_blank">
                    <Image
                      src={t.img}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="border-2 border-magna rounded-full object-cover"
                    />
                  </Link>
                  <div className="ml-4">
                    <div className="font-bold">{t.name}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      {t.title}, <span className="font-bold">{t.company}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
