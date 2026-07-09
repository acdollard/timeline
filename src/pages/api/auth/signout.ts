// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { clearAuthSessionCookies } from "../../../lib/supabase";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  clearAuthSessionCookies(cookies);
  return redirect("/");
};