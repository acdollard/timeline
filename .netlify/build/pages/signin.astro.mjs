import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_cefmmz3r.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_iIFij7cA.mjs';
import { s as supabase } from '../chunks/supabase_riZVRtFr.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Signin = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Signin;
  const { cookies, redirect, request } = Astro2;
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const success = url.searchParams.get("success");
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");
  if (accessToken && refreshToken) {
    try {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value
      });
      if (session && !sessionError) {
        return redirect("/");
      }
    } catch (e) {
      console.error("Error validating session:", e);
    }
  }
  const getErrorMessage = (error2) => {
    switch (error2) {
      case "invalid_credentials":
        return "Invalid email or password. Please try again.";
      case "email_not_confirmed":
        return "Please confirm your email address before signing in.";
      case "invalid_email_format":
        return "Please enter a valid email address.";
      case "missing_fields":
        return "Please fill in all required fields.";
      default:
        return "An error occurred. Please try again.";
    }
  };
  const getSuccessMessage = (success2) => {
    switch (success2) {
      case "password_updated":
        return "Password updated successfully! You can now sign in with your new password.";
      default:
        return "Operation completed successfully!";
    }
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Sign in" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center h-screen bg-darkestGray"> <div class="bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-4 w-full max-w-md p-8 text-white"> <h1 class="text-2xl font-bold">Sign in</h1> <p class="text-sm text-gray-400">
Welcome back! Please enter your details.
</p> ${error && renderTemplate`<div class="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-md"> <p class="text-sm text-red-400">${getErrorMessage(error)}</p> </div>`} ${success && renderTemplate`<div class="w-full p-3 bg-green-500/10 border border-green-500/20 rounded-md"> <p class="text-sm text-green-400">${getSuccessMessage(success)}</p> </div>`} <form action="/api/auth/signin" method="post" class="flex flex-col items-center justify-center gap-4 w-full"> <div class="w-full"> <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label> <input type="email" name="email" id="email" required class="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"> </div> <div class="w-full"> <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Password</label> <input type="password" name="password" id="password" required class="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"> <div class="flex justify-end mt-1"> <a href="/forgot-password" class="text-sm text-primary hover:text-primary/90 transition-colors">
Forgot your password?
</a> </div> </div> <button type="submit" class="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
Sign in
</button> </form> <p class="text-sm text-gray-400">
New here?
<a href="/register" class="text-primary hover:text-primary/90 ml-1">Create an account</a> </p> </div> </div> ` })}`;
}, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/signin.astro", void 0);

const $$file = "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/signin.astro";
const $$url = "/signin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Signin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
