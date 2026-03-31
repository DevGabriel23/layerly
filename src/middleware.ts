// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { createSupabaseSSR } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
	const supabase = createSupabaseSSR(context);

	// 1. Validamos al usuario una sola vez en el servidor
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Guardamos al usuario en locals para usarlo en las páginas .astro sin re-consultar
	context.locals.user = user;

	const pathname = context.url.pathname;
	const isDashboard = pathname.startsWith("/dashboard");
	const isHome = pathname === "/";

	if (isDashboard && !user) {
		return context.redirect("/");
	}

	if (isHome && user) {
		return context.redirect("/dashboard");
	}

	return next();
});
