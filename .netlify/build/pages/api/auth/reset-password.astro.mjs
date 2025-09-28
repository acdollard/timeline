import { s as supabase } from '../../../chunks/supabase_riZVRtFr.mjs';
import { l as logger } from '../../../chunks/logger_BUOLHH5s.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm_password");
    const accessToken = formData.get("access_token");
    const refreshToken = formData.get("refresh_token");
    if (!password || !confirmPassword || !accessToken || !refreshToken) {
      return redirect("/reset-password?error=missing_fields");
    }
    if (password.length < 6) {
      return redirect("/reset-password?error=password_too_short");
    }
    if (password !== confirmPassword) {
      return redirect("/reset-password?error=password_mismatch");
    }
    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (sessionError || !session) {
      logger.error("Session error in password reset", { error: sessionError });
      return redirect("/forgot-password?error=invalid_link");
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password
    });
    if (updateError) {
      logger.error("Password update error", {
        userId: session.user.id,
        error: updateError.message
      });
      if (updateError.message.includes("weak")) {
        return redirect("/reset-password?error=weak_password");
      }
      return redirect("/reset-password?error=update_failed");
    }
    return redirect("/signin?success=password_updated");
  } catch (error) {
    logger.error("Unexpected error in password reset", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return redirect("/reset-password?error=unknown");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
