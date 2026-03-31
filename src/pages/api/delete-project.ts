// src/pages/api/delete-project.ts

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
		const { projectId } = await context.request.json();

		if (!projectId) {
			return new Response(
				JSON.stringify({ error: "Falta el ID del proyecto" }),
				{ status: 400 },
			);
		}

		const folderPath = `users/${user.id}/projects/${projectId}`;

		try {
			await deleteFolderFromCloudinary(folderPath);
		} catch (cloudinaryErr) {
			console.error(
				"Fallo al limpiar carpeta en Cloudinary:",
				cloudinaryErr,
			);
		}

		const { error: dbError } = await supabase
			.from("avatar_config")
			.delete()
			.eq("id", projectId)
			.eq("user_id", user.id);

		if (dbError) throw dbError;

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (e: any) {
		console.error("[API DELETE PROJECT ERROR]:", e.message);
		return new Response(
			JSON.stringify({ error: "Error interno al eliminar el proyecto" }),
			{
				status: 500,
			},
		);
	}
};
