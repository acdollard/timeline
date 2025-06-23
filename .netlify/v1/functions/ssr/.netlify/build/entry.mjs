import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_BXYzU-nq.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/auth/register.astro.mjs');
const _page3 = () => import('./pages/api/auth/signin.astro.mjs');
const _page4 = () => import('./pages/api/auth/signout.astro.mjs');
const _page5 = () => import('./pages/api/event-types/_id_.astro.mjs');
const _page6 = () => import('./pages/api/event-types.astro.mjs');
const _page7 = () => import('./pages/api/events/_id_.astro.mjs');
const _page8 = () => import('./pages/api/events.astro.mjs');
const _page9 = () => import('./pages/api/health.astro.mjs');
const _page10 = () => import('./pages/api/seed-data.astro.mjs');
const _page11 = () => import('./pages/api/test-config.astro.mjs');
const _page12 = () => import('./pages/dashboard.astro.mjs');
const _page13 = () => import('./pages/register.astro.mjs');
const _page14 = () => import('./pages/signin.astro.mjs');
const _page15 = () => import('./pages/summary.astro.mjs');
const _page16 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/auth/register.ts", _page2],
    ["src/pages/api/auth/signin.ts", _page3],
    ["src/pages/api/auth/signout.ts", _page4],
    ["src/pages/api/event-types/[id].ts", _page5],
    ["src/pages/api/event-types.ts", _page6],
    ["src/pages/api/events/[id].ts", _page7],
    ["src/pages/api/events.ts", _page8],
    ["src/pages/api/health.ts", _page9],
    ["src/pages/api/seed-data.ts", _page10],
    ["src/pages/api/test-config.ts", _page11],
    ["src/pages/dashboard.astro", _page12],
    ["src/pages/register.astro", _page13],
    ["src/pages/signin.astro", _page14],
    ["src/pages/summary.astro", _page15],
    ["src/pages/index.astro", _page16]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "55acf182-b34e-4f93-b3fa-ff3ad96907c3"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
