import { s as supabase } from '../../../chunks/supabase_riZVRtFr.mjs';
import { l as logger } from '../../../chunks/logger_BUOLHH5s.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    if (!email || !email.includes("@")) {
      return redirect("/forgot-password?error=invalid_email");
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`
    });
    if (error) {
      logger.error("Password reset error", {
        email,
        error: error.message
      });
      if (error.message.includes("User not found")) {
        return redirect("/forgot-password?error=user_not_found");
      }
      if (error.message.includes("Too many requests")) {
        return redirect("/forgot-password?error=too_many_requests");
      }
      return redirect("/forgot-password?error=unknown");
    }
    return redirect("/forgot-password?success=reset_email_sent");
  } catch (error) {
    logger.error("Unexpected error in forgot password", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return redirect("/forgot-password?error=unknown");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
