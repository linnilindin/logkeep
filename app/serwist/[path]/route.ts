import { spawnSync } from 'node:child_process';
import { createSerwistRoute } from '@serwist/turbopack';

// Versions the extra precached entries so a deploy cannot serve a stale offline
// page. Vercel exposes the commit directly; fall back to git when building
// locally.
const revision =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ||
  crypto.randomUUID();

// Serwist only precaches build assets and public files by default, so the HTML
// documents have to be listed explicitly. Without them an offline launch falls
// straight through to /~offline and the app shell never renders.
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [
      { url: '/', revision },
      { url: '/login', revision },
      { url: '/~offline', revision },
    ],
    swSrc: 'app/sw.ts',
    useNativeEsbuild: true,
  });
