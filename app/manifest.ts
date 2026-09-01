import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'LogKeep',
    short_name: 'LogKeep',
    description: 'Track your reading progress across manga, manhwa, novels, and books.',
    start_url: '/',
    display: 'standalone',
    // Matches dark mode, which is what the app falls back to before the stored
    // theme preference is read, so the splash screen does not flash light.
    background_color: '#121212',
    theme_color: '#121212',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
