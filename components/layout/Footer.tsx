import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-4 sm:flex justify-center items-center gap-20 border-t border-gray-100">
      <div>
        <Image
          src="/img/logo/Magna-Hire-Normal.png"
          alt="Magna Hire"
          width={50}
          height={50}
          className="mx-auto"
        />
      </div>
      <p className="text-sm text-center text-gray-500 max-sm:mt-2">
        &copy; Mentorverse Private Limited 2024
      </p>
      <Link
        href="http://magnahire.in/privacy"
        target="_blank"
        className="text-sm font-normal text-magna underline"
      >
        Privacy Policy
      </Link>
    </footer>
  );
}
