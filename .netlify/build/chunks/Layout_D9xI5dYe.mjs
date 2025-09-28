import { e as createComponent, f as createAstro, n as renderHead, k as renderComponent, o as renderSlot, r as renderTemplate } from './astro/server_cefmmz3r.mjs';
import 'kleur/colors';
/* empty css                         */
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_riZVRtFr.mjs';

const Navbar = ({ initialSession }) => {
  const [session, setSession] = useState(initialSession);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  return /* @__PURE__ */ jsxs("nav", { className: "flex flex-row justify-between items-center py-4 w-full px-6 relative", children: [
    /* @__PURE__ */ jsx("a", { href: "/", className: "text-white text-xl font-bold", children: /* @__PURE__ */ jsx("img", { src: "/logo.svg", alt: "Timeline Logo", className: "h-10" }) }),
    /* @__PURE__ */ jsxs("ul", { className: "hidden md:flex flex-row justify-between items-center text-white gap-4", children: [
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
            className: "bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md transition-colors",
            children: "Sign Out"
          }
        ) })
      ] }) : /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            window.location.href = "/signin";
          },
          className: "bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md transition-colors",
          children: "Sign In"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "md:hidden text-white p-2",
        onClick: toggleMenu,
        "aria-label": "Toggle menu",
        children: /* @__PURE__ */ jsxs("div", { className: "w-6 h-6 flex flex-col justify-center items-center", children: [
          /* @__PURE__ */ jsx("span", { className: `block w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1" : ""}` }),
          /* @__PURE__ */ jsx("span", { className: `block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${isMenuOpen ? "opacity-0" : ""}` }),
          /* @__PURE__ */ jsx("span", { className: `block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${isMenuOpen ? "-rotate-45 -translate-y-1" : ""}` })
        ] })
      }
    ),
    isMenuOpen && /* @__PURE__ */ jsx("div", { className: "md:hidden fixed inset-0 bg-black bg-opacity-50 z-40", onClick: closeMenu, children: /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 h-full w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col p-6 space-y-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "self-end text-white p-2",
          onClick: closeMenu,
          "aria-label": "Close menu",
          children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      ),
      /* @__PURE__ */ jsxs("ul", { className: "flex flex-col space-y-4 text-white", children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/", className: "hover:text-primary transition-colors py-2", onClick: closeMenu, children: "Home" }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/about", className: "hover:text-primary transition-colors py-2", onClick: closeMenu, children: "About" }) }),
        session ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/summary", className: "hover:text-primary transition-colors py-2", onClick: closeMenu, children: "My Timeline" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                closeMenu();
                window.location.href = "/api/auth/signout";
              },
              className: "bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md transition-colors w-full text-left",
              children: "Sign Out"
            }
          ) })
        ] }) : /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              closeMenu();
              window.location.href = "/signin";
            },
            className: "bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md transition-colors w-full text-left",
            children: "Sign In"
          }
        ) })
      ] })
    ] }) }) })
  ] });
};

const BackButton = ({
  href,
  className = "fixed top-20 left-6 z-50 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center space-x-2"
}) => {
  const handleBack = () => {
    if (href) {
      window.location.href = href;
    } else {
      window.history.back();
    }
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: handleBack,
      className,
      "aria-label": "Go back",
      children: [
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "w-5 h-5",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M15 19l-7-7 7-7"
              }
            )
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Back" })
      ]
    }
  );
};

const $$Astro = createAstro();
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "Timeline",
    requireAuth = false,
    showBackButton = true
  } = Astro2.props;
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
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderHead()}</head> <body class="bg-gray-900 min-h-screen"> ${renderComponent($$result, "Navbar", Navbar, { "client:load": true, "initialSession": session, "client:component-hydration": "load", "client:component-path": "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/components/Navbar", "client:component-export": "default" })} ${showBackButton && renderTemplate`${renderComponent($$result, "BackButton", BackButton, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/components/BackButton", "client:component-export": "default" })}`} <main> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
