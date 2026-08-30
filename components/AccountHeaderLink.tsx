import Link from 'next/link';
import AccountIcon from './icons/AccountIcon';

export default function AccountHeaderLink({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Link href="/cuenta" aria-label="Mi cuenta" className="relative text-ink">
      <AccountIcon className="h-6 w-6" />
      {isAdmin && (
        <span className="absolute -right-1 -top-1 text-[10px] leading-none">👑</span>
      )}
    </Link>
  );
}
