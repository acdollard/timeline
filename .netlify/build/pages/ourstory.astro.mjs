import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_cefmmz3r.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_iIFij7cA.mjs';
export { renderers } from '../renderers.mjs';

const $$OurStory = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-4xl mx-auto px-4 py-12"> <article class="space-y-8"> <header class="space-y-4"> <h1 class="text-4xl md:text-5xl font-bold text-white">
Our <span class="text-primary animate-[ripple_2s_ease-in-out_infinite]">Story</span> </h1> </header> <h2 class="text-2xl font-bold text-white">Mark</h2> <p class="text-lg text-gray-300 max-w-3xl">
Some of the best memories I have are of stories I was told by relatives
        of mine that are now long gone. Stories about accomplishment, adventure,
        travel and humor. Stories about hard times, good times and family
        history. Some I remember with great clarity - others have details that
        now escape me. I realized one day that much of this would most likely be
        lost for future generations. I wanted a way to preserve these pieces of
        life and important family information before it was forever lost. The
        solution was MyTimeLineOnline, an easy way to collect and preserve for
        future generations those memories and historical events that make all of
        our families unique.
<br><br> </p><div class="block text-right"> <span class="font-bold text-zinc-300 text-right">Mark A. McElravy</span> <p class="text-lg text-gray-300">Creator, MyTimeLineOnline</p> </div>  <br> <h2 class="text-2xl font-bold text-white">Alex</h2> <p class="text-lg text-gray-300 max-w-3xl">
I’m named after my mom’s Great Uncle Carroll (Carroll is my middle name)
        who was my grandfather's brother. Unfortunately both he and my
        grandfather passed away before I was born, so I never got the chance to
        meet either of them. Uncle Carroll was known as a voracious reader and
        someone with a brilliant sense of humor. Grandpa Casey was a Lieutenant
        Colonel in the Navy during WWII and was present during the liberation of
        some of the concentration camps.
<br> What I’ve just written is almost the entirety of what I know about
        those two men. And yet, in a way they’re both still a part of my life. What
        if I’d had the chance to go back and ask them about their lives? What if
        I was able to capture the broad strokes of their stories in a way that could
        be preserved not only for me, but for my future kids? These are things that
        I would really love to know. I might have missed the chance with them, but
        we can do something to help others. This is why we built MyTimelineOnline,
        and why we think it’s an important mission.
<br><br> </p><div class="block text-right"> <span class="font-bold text-zinc-300 text-right">Alex Dollard</span> <p class="text-lg text-gray-300">Lead Developer</p> </div>  </article> <article></article> <nav class="pt-8"> <a href="/summary" class="inline-block bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-6 py-3 rounded-md font-medium transition-all duration-300" aria-label="Go to your timeline">
Start Your Timeline
</a> </nav> </main> ` })}`;
}, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/ourStory.astro", void 0);

const $$file = "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/ourStory.astro";
const $$url = "/ourStory";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$OurStory,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
