import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../chunks/astro/server_cefmmz3r.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_D9xI5dYe.mjs';
import { s as supabase } from '../chunks/supabase_riZVRtFr.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$ForgotPassword = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ForgotPassword;
  const { cookies, redirect, request } = Astro2;
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const success = url.searchParams.get("success");
  const hasHashTokens = url.hash.includes("access_token");
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
      case "invalid_email":
        return "Please enter a valid email address.";
      case "user_not_found":
        return "No account found with this email address.";
      case "too_many_requests":
        return "Too many password reset attempts. Please try again later.";
      case "invalid_link":
        return "The password reset link is invalid or has expired. Please request a new one.";
      default:
        return "An error occurred. Please try again.";
    }
  };
  const getSuccessMessage = (success2) => {
    switch (success2) {
      case "reset_email_sent":
        return "Password reset email sent! Please check your inbox.";
      default:
        return "Password reset email sent! Please check your inbox.";
    }
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Forgot Password" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center h-screen bg-darkestGray"> <div class="bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-4 w-full max-w-md p-8 text-white"> <h1 class="text-2xl font-bold">Forgot Password</h1> <p class="text-sm text-gray-400 text-center">
Enter your email address and we'll send you a link to reset your
        password.
</p> ${error && renderTemplate`<div class="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-md"> <p class="text-sm text-red-400">${getErrorMessage(error)}</p> </div>`} ${success && renderTemplate`<div class="w-full p-3 bg-green-500/10 border border-green-500/20 rounded-md"> <p class="text-sm text-green-400">${getSuccessMessage(success)}</p> </div>`} <form action="/api/auth/forgot-password" method="post" class="flex flex-col items-center justify-center gap-4 w-full"> <div class="w-full"> <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label> <input type="email" name="email" id="email" required class="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"> </div> <button type="submit" class="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
Send Reset Link
</button> </form> <div class="flex flex-col items-center gap-2"> <a href="/signin" class="text-sm text-primary hover:text-primary/90 transition-colors">
Back to Sign In
</a> <p class="text-sm text-gray-400">
Don't have an account?
<a href="/register" class="text-primary hover:text-primary/90 ml-1">Create one</a> </p> </div> </div> </div> ${hasHashTokens && renderTemplate`${renderScript($$result2, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/forgot-password.astro?astro&type=script&index=0&lang.ts")}`} ${renderScript($$result2, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/forgot-password.astro?astro&type=script&index=1&lang.ts")} ` })}`;
}, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/forgot-password.astro", void 0);

const $$file = "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/forgot-password.astro";
const $$url = "/forgot-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ForgotPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
