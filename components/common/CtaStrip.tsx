interface CtaStripProps {
  heading: string;
  buttonLabel: string;
  buttonHref: string;
  external?: boolean;
}

export default function CtaStrip({ heading, buttonLabel, buttonHref, external }: CtaStripProps) {
  return (
    <section className="w-full py-10 bg-magna">
      <div className="container items-center justify-between gap-4 sm:flex">
        <div className="max-sm:mb-4">
          <h2 className="text-3xl text-white max-sm:text-2xl">{heading}</h2>
        </div>
        <a
          href={buttonHref}
          className="hami-btn btn-2"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {buttonLabel}
        </a>
      </div>
    </section>
  );
}
