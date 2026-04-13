import Image from 'next/image';

interface BrandsSliderProps {
  images: string[];   // array of /img/... paths
  title?: string;
}

export default function BrandsSlider({ images, title }: BrandsSliderProps) {
  // Duplicate for infinite loop
  const doubled = [...images, ...images];

  return (
    <section className="w-full py-14 max-lg:py-8">
      <div className="container">
        {title && (
          <div className="mb-10 text-center">
            <h2 className="text-4xl">{title}</h2>
          </div>
        )}
        <div className="slider">
          <div className="slide-track">
            {doubled.map((src, i) => (
              <div key={i} className="slide">
                <Image src={src} alt="" width={100} height={100} unoptimized />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
