// src/pages/api/auth/callback.ts
import type { APIRoute } from "astro";
import { createSupabaseSSR } from "../../../lib/supabase";

export const GET: APIRoute = async (context) => {
	const code = context.url.searchParams.get("code");
  const next = context.url.searchParams.get("next") ?? "/dashboard";

  console.log("code", code);
  console.log("next", next);

  if (code) {
    const supabase = createSupabaseSSR(context);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("error", error);

    if (!error) {
      return context.redirect(next);
    }
  }

  return context.redirect("/?error=auth_failed");
};
