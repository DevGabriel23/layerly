// src/pages/api/delete-variant.ts

import type { APIRoute } from "astro";
import { deleteFromCloudinary } from "../../utils/cloudinary";
import { createSupabaseSSR } from "../../lib/supabase";

export const POST: APIRoute = async (context) => {
	const supabase = createSupabaseSSR(context);

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return new Response(
			JSON.stringify({ error: "Sesión inválida o expirada" }),
			{
				status: 401,
			},
		);
	}

	try {
		const { variantId } = await context.request.json();

		const { data: variant, error: fetchError } = await supabase
			.from("variants")
			.select("public_id_master, public_id_proxy")
			.eq("id", variantId)
			.maybeSingle();

		if (fetchError || !variant) {
			return new Response(
				JSON.stringify({ error: "Variante no encontrada" }),
				{
					status: 404,
				},
			);
		}

		try {
			const cloudinaryTasks = [];
			if (variant.public_id_master)
				cloudinaryTasks.push(
					deleteFromCloudinary(variant.public_id_master),
				);
			if (variant.public_id_proxy)
				cloudinaryTasks.push(
					deleteFromCloudinary(variant.public_id_proxy),
				);

			await Promise.all(cloudinaryTasks);
		} catch (cloudinaryErr) {
			console.error(
				"Error al limpiar archivos en Cloudinary:",
				cloudinaryErr,
			);
		}

		const { error: dbError } = await supabase
			.from("variants")
			.delete()
			.eq("id", variantId);

		if (dbError) throw dbError;

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (e: any) {
		console.error("[API DELETE VARIANT ERROR]:", e.message);
		return new Response(
			JSON.stringify({ error: "No se pudo eliminar la variante" }),
			{
				status: 500,
			},
		);
	}
};
