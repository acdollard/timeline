// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/register?error=missing_fields");
  }

  try {
    // Get the origin URL for email redirect
    const origin = new URL(request.url).origin;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/confirm-email`,
      },
    });

    if (error) {
      // Handle specific error cases
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
      // Registration successful, redirect to signin with success message
      return redirect("/signin?message=check_email");
    }

    return redirect("/register?error=unknown");
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    return redirect("/register?error=unknown");
  }
};