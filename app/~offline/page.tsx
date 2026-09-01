import { WifiOff } from 'lucide-react';

export const metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4 transition-colors">
      <div className="max-w-sm text-center">
        <WifiOff
          size={32}
          className="mx-auto mb-4 text-light-text-secondary dark:text-dark-text-secondary"
        />
        <h1 className="font-title text-2xl font-bold text-accent">You are offline</h1>
        <p className="mt-3 font-sans text-sm text-light-text-secondary dark:text-dark-text-secondary">
          LogKeep needs a connection to load your library. This page will work again
          once you are back online.
        </p>
      </div>
    </main>
  );
}
