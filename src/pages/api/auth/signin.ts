// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/signin?error=missing_fields");
  }

  try {
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
      const { access_token, refresh_token } = data.session;
      
      // Set cookies
      cookies.set("sb-access-token", access_token, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      
      cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return redirect("/");
    }

    return redirect("/signin?error=unknown");
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    return redirect("/signin?error=unknown");
  }
};