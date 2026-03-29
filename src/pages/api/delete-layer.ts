import type { APIRoute } from "astro";
import { deleteFolderFromCloudinary } from "../../utils/cloudinary";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;

	if (!accessToken || !refreshToken)
		return new Response("No autorizado", { status: 401 });

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken,
	});

	if (authError || !user)
		return new Response("Sesión inválida", { status: 401 });

	try {
		const { layerId } = await request.json();

		const { data: layer, error: fetchError } = await supabase
			.from("layers")
			.select("project_id")
			.eq("id", layerId)
			.single();

		if (fetchError || !layer) throw new Error("Capa no encontrada");

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

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: e.message }), {
			status: 500,
		});
	}
};
