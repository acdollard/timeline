import { s as supabase } from '../../../chunks/supabase_riZVRtFr.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  if (!email || !password) {
    return redirect("/signin?error=missing_fields");
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      switch (error.message) {
        case "Invalid login credentials":
          return redirect("/signin?error=invalid_credentials");
        case "Email not confirmed":
          return redirect("/signin?error=email_not_confirmed");
        case "Invalid email":
          return redirect("/signin?error=invalid_email_format");
        default:
          console.error("Sign in error:", error.message);
          return redirect("/signin?error=unknown");
      }
    }
    if (data.session) {
      const { access_token, refresh_token } = data.session;
      cookies.set("sb-access-token", access_token, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7
        // 1 week
      });
      cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7
        // 1 week
      });
      return redirect("/");
    }
    return redirect("/signin?error=unknown");
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    return redirect("/signin?error=unknown");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
