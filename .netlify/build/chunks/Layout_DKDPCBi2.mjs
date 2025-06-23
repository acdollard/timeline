import { e as createComponent, f as createAstro, l as renderHead, k as renderComponent, n as renderSlot, r as renderTemplate } from './astro/server_DuNtUCWs.mjs';
import 'kleur/colors';
/* empty css                         */
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_riZVRtFr.mjs';

const Navbar = ({ initialSession }) => {
  const [session, setSession] = useState(initialSession);
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);
  return /* @__PURE__ */ jsxs("nav", { className: "flex flex-row justify-between items-center py-4 w-full px-6", children: [
    /* @__PURE__ */ jsx("a", { href: "/", className: "text-white text-xl font-bold", children: "Timeline" }),
    /* @__PURE__ */ jsxs("ul", { className: "flex flex-row justify-between items-center text-white gap-4", children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/", className: "hover:text-primary transition-colors", children: "Home" }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/about", className: "hover:text-primary transition-colors", children: "About" }) }),
      session ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/summary", className: "hover:text-primary transition-colors", children: "My Timeline" }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              window.location.href = "/api/auth/signout";
            },
            className: "bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors",
            children: "Sign Out"
          }
        ) })
      ] }) : /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            window.location.href = "/signin";
          },
          className: "bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors",
          children: "Sign In"
        }
      ) })
    ] })
  ] });
};

const $$Astro = createAstro();
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "Timeline", requireAuth = false } = Astro2.props;
  const accessToken = Astro2.cookies.get("sb-access-token");
  const refreshToken = Astro2.cookies.get("sb-refresh-token");
  let session = null;
  if (accessToken && refreshToken) {
    try {
      const result = await supabase.auth.setSession({
        refresh_token: refreshToken.value,
        access_token: accessToken.value
      });
      if (!result.error) {
        session = result.data.session;
      }
    } catch (error) {
    }
  }
  if (requireAuth && !session) {
    return Astro2.redirect("/signin");
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderHead()}</head> <body class="bg-gray-900 min-h-screen"> ${renderComponent($$result, "Navbar", Navbar, { "client:load": true, "initialSession": session, "client:component-hydration": "load", "client:component-path": "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/components/Navbar", "client:component-export": "default" })} <main> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
