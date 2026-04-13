import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

interface BaseProps {
  variant?: 'filled' | 'outline';
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export default function Button({ variant = 'filled', loading, className = '', children, ...rest }: ButtonProps) {
  const cls = `hami-btn${variant === 'outline' ? ' btn-2' : ''} ${className}`.trim();

  if ('href' in rest && rest.href) {
    const { href, ...anchor } = rest as { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={cls} {...anchor}>
        {loading ? 'Please wait…' : children}
      </Link>
    );
  }

  const btnRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={cls} disabled={loading || btnRest.disabled} {...btnRest}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
