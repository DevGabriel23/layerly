// src/pages/api/delete-layer.ts

import type { APIRoute } from "astro";
import { deleteFolderFromCloudinary } from "../../utils/cloudinary";
import { createSupabaseSSR } from "../../lib/supabase";

export const POST: APIRoute = async (context) => {
	const supabase = createSupabaseSSR(context);

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return new Response(JSON.stringify({ error: "No autorizado" }), {
			status: 401,
		});
	}

	try {
		const { layerId } = await context.request.json();

		const { data: layer, error: fetchError } = await supabase
			.from("layers")
			.select("project_id")
			.eq("id", layerId)
			.single();

		if (fetchError || !layer) {
			return new Response(
				JSON.stringify({ error: "Capa no encontrada" }),
				{ status: 404 },
			);
		}

		const folderPath = `users/${user.id}/projects/${layer.project_id}/layers/${layerId}`;

		try {
			await deleteFolderFromCloudinary(folderPath);
		} catch (cloudinaryError) {
			console.error("Fallo no crítico en Cloudinary:", cloudinaryError);
		}

		const { error: dbError } = await supabase
			.from("layers")
			.delete()
			.eq("id", layerId);

		if (dbError) throw dbError;

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (e: any) {
		console.error("[API DELETE LAYER ERROR]:", e.message);
		return new Response(
			JSON.stringify({ error: "Error interno del servidor" }),
			{
				status: 500,
			},
		);
	}
};
