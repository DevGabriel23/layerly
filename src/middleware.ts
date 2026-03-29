// src/middleware.ts

import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer } from "./lib/supabase";

export const onRequest = defineMiddleware(async ({ locals, url, redirect, cookies }, next) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  const isProtectedRoute = url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/editor");

  if (isProtectedRoute) {
    if (!accessToken || !refreshToken) return redirect("/");

    const supabase = createSupabaseServer();
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
      return redirect("/");
    }

    // Inyectamos el usuario y el token en locals
    locals.user = data.session.user;
    locals.token = data.session.access_token;
  }

  return next();
});