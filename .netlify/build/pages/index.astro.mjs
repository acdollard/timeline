import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DuNtUCWs.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DKDPCBi2.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto flex flex-col md:flex-row py-10 max-w-7xl h-[80vh] text-white px-6"> <div class="w-full md:w-1/2 flex flex-col items-start justify-center"> <h1 class="font-bold text-left text-4xl md:text-5xl mb-4 animate-slideInLeft">
Share your <span class="text-primary">Story.</span> </h1> <h1 class="font-bold text-left text-4xl md:text-5xl mb-4 animate-slideInLeft delay-100">
Preserve your <span class="text-secondary-blue animate-ripple">Memories.</span> </h1> <h1 class="font-bold text-left text-4xl md:text-5xl mb-4 animate-slideInLeft delay-200">
Build Your <span class="text-secondary-purple">Timeline.</span> </h1> <div class="flex flex-row gap-4 mt-4"> <a href="/summary"> <button class="bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md cursor-pointer">
Go To My Timeline
</button> </a> <a href="/about"> <button class="bg-gradient-to-b from-cyan-700 to-cyan-500 hover:from-cyan-500 hover:to-cyan-700 text-white px-4 py-2 rounded-md cursor-pointer">
Read Our Story
</button> </a> </div> </div> <div class="w-full md:w-1/2 flex items-center justify-center"> <p>*Image goes here*</p> </div> </div> ` })}`;
}, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/index.astro", void 0);

const $$file = "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
