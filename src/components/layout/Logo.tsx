import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Web Journal home"
      className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg text-lg font-bold tracking-tight"
    >
      <Image
        src="/brand/web-journal-mark.png"
        alt=""
        aria-hidden
        width={64}
        height={36}
        priority
        className="h-9 w-16 object-contain"
      />
      <span>Web Journal</span>
    </Link>
  );
}
