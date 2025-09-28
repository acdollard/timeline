import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../chunks/astro/server_cefmmz3r.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_iIFij7cA.mjs';
import { s as supabase } from '../chunks/supabase_riZVRtFr.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$ResetPassword = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ResetPassword;
  const { cookies, redirect, request } = Astro2;
  const url = new URL(request.url);
  const access_token = url.searchParams.get("access_token");
  const refresh_token = url.searchParams.get("refresh_token");
  const error = url.searchParams.get("error");
  const success = url.searchParams.get("success");
  const hasHashTokens = url.hash.includes("access_token");
  if (!access_token || !refresh_token) {
    if (!hasHashTokens) {
      return redirect("/forgot-password?error=invalid_link");
    }
  }
  let session = null;
  let sessionError = null;
  if (access_token && refresh_token) {
    const sessionResult = await supabase.auth.setSession({
      access_token,
      refresh_token
    });
    session = sessionResult.data.session;
    sessionError = sessionResult.error;
  }
  if (access_token && refresh_token && (sessionError || !session)) {
    return redirect("/forgot-password?error=invalid_link");
  }
  const getErrorMessage = (error2) => {
    switch (error2) {
      case "invalid_link":
        return "Invalid or expired reset link. Please request a new one.";
      case "password_too_short":
        return "Password must be at least 6 characters long.";
      case "password_mismatch":
        return "Passwords do not match.";
      case "weak_password":
        return "Password is too weak. Please choose a stronger password.";
      default:
        return "An error occurred. Please try again.";
    }
  };
  const getSuccessMessage = (success2) => {
    switch (success2) {
      case "password_updated":
        return "Password updated successfully! You can now sign in with your new password.";
      default:
        return "Password updated successfully!";
    }
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Reset Password" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center h-screen bg-darkestGray"> <div class="bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-4 w-full max-w-md p-8 text-white"> <h1 class="text-2xl font-bold">Reset Password</h1> <p class="text-sm text-gray-400 text-center">
Enter your new password below.
</p> ${error && renderTemplate`<div class="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-md"> <p class="text-sm text-red-400">${getErrorMessage(error)}</p> </div>`} ${success && renderTemplate`<div class="w-full p-3 bg-green-500/10 border border-green-500/20 rounded-md"> <p class="text-sm text-green-400">${getSuccessMessage(success)}</p> </div>`} <form action="/api/auth/reset-password" method="post" class="flex flex-col items-center justify-center gap-4 w-full" id="reset-form"> <input type="hidden" name="access_token"${addAttribute(access_token || "", "value")}> <input type="hidden" name="refresh_token"${addAttribute(refresh_token || "", "value")}> <div class="w-full"> <label for="password" class="block text-sm font-medium text-gray-300 mb-1">New Password</label> <input type="password" name="password" id="password" required minlength="6" class="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"> </div> <div class="w-full"> <label for="confirm_password" class="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label> <input type="password" name="confirm_password" id="confirm_password" required minlength="6" class="w-full bg-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"> </div> <button type="submit" class="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
Update Password
</button> </form> <div class="flex flex-col items-center gap-2"> <a href="/signin" class="text-sm text-primary hover:text-primary/90 transition-colors">
Back to Sign In
</a> </div> </div> </div> ${hasHashTokens && renderTemplate`${renderScript($$result2, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/reset-password.astro?astro&type=script&index=0&lang.ts")}`}` })}`;
}, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/reset-password.astro", void 0);

const $$file = "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/reset-password.astro";
const $$url = "/reset-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ResetPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
