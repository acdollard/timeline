import { s as supabase } from '../../../chunks/supabase_riZVRtFr.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  if (!email || !password) {
    return redirect("/register?error=missing_fields");
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) {
      switch (error.message) {
        case "User already registered":
          return redirect("/register?error=email_exists");
        case "Password should be at least 6 characters":
          return redirect("/register?error=password_too_short");
        case "Invalid email":
          return redirect("/register?error=invalid_email_format");
        default:
          console.error("Registration error:", error.message);
          return redirect("/register?error=unknown");
      }
    }
    if (data?.user) {
      return redirect("/signin?message=check_email");
    }
    return redirect("/register?error=unknown");
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    return redirect("/register?error=unknown");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
