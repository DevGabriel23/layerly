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
	const searchParams = context.url.searchParams;
	const isDashboard = pathname.startsWith("/dashboard");
	const isEditor = pathname.startsWith("/editor");
	const isHome = pathname === "/";

	const isPublicParam = searchParams.get("view") === "public";

	if (isEditor) {
		if (!isPublicParam) {
			const publicUrl = new URL(context.url);

			if (!user) {
				publicUrl.searchParams.set("view", "public");
			} else {
				return context.redirect("/dashboard?error=unauthorized");
			}

			return context.redirect(publicUrl.toString());
		}
	}

	if (isDashboard && !user) {
		return context.redirect("/");
	}

	if (isHome && user) {
		return context.redirect("/dashboard");
	}

	return next();
});
