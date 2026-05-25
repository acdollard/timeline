// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { createRequestSupabaseClient, setAuthSessionCookies } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/signin?error=missing_fields");
  }

  try {
    const supabase = createRequestSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases
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
      setAuthSessionCookies(cookies, data.session);

      return redirect("/");
    }

    return redirect("/signin?error=unknown");
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    return redirect("/signin?error=unknown");
  }
};