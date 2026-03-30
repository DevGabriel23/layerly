// src/lib/supabase.ts
import { createServerClient, createBrowserClient } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "../types/supabase";

// 1. Cliente para el NAVEGADOR (Lado del cliente)
export const supabase = createBrowserClient<Database>(
	import.meta.env.PUBLIC_SUPABASE_URL,
	import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
);

export function createSupabaseSSR({ cookies }: { cookies: AstroCookies }) {
	const finalCookieOptions = {
		sameSite: "lax",
		secure: import.meta.env.PROD,
		path: "/",
	} as const;

	return createServerClient<Database>(
		import.meta.env.PUBLIC_SUPABASE_URL,
		import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get: (name) => cookies.get(name)?.value,
				set: (name, value, options) => {
					cookies.set(name, value, {
						...options,
						...finalCookieOptions,
					});
				},
				remove: (name, options) => {
					cookies.delete(name, {
						...options,
						...finalCookieOptions,
					});
				},
			},
		},
	);
}
