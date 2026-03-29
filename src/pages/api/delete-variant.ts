// src/pages/api/delete-variant.ts
import type { APIRoute } from "astro";
import { deleteFromCloudinary } from "../../utils/cloudinary";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
	// 1. Intentar obtener el usuario directamente de las cookies si locals falló
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;

	if (!accessToken || !refreshToken) {
		return new Response("No autorizado: Faltan tokens", { status: 401 });
	}

	// Validar con Supabase manualmente en el servidor
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken,
	});

	if (authError || !user) {
		return new Response("Sesión inválida", { status: 401 });
	}
	try {
		const { variantId } = await request.json();

		// 1. Obtener las URLs antes de borrar el registro
		const { data: variant, error: fetchError } = await supabase
			.from("variants")
			.select("public_id_master, public_id_proxy")
			.eq("id", variantId)
			.single();

		if (fetchError || !variant) throw new Error("Variante no encontrada");

		// 2. Borrar en Cloudinary (en paralelo)
		await Promise.all([
			deleteFromCloudinary(variant.public_id_master!),
			deleteFromCloudinary(variant.public_id_proxy!),
		]);

		// 3. Borrar en Supabase
		const { error: dbError } = await supabase
			.from("variants")
			.delete()
			.eq("id", variantId);

		if (dbError) throw dbError;

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: e.message }), {
			status: 500,
		});
	}
};
