import { createWatchPaths } from '@nx/remix';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  tailwind: true,
  ignoredRouteFiles: ['**/.*'],
  browserNodeBuiltinsPolyfill: { modules: { url: true } },
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  watchPaths: () => createWatchPaths(__dirname),
};
