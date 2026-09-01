'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      aria-label="Sign out"
      title="Sign out"
      className="flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-accent transition-colors cursor-pointer"
    >
      <LogOut size={16} />
    </button>
  );
}
