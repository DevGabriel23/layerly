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
		const { projectId } = await request.json();

		// 1. Ruta raíz del proyecto en Cloudinary
		const folderPath = `users/${user.id}/projects/${projectId}`;

		// 2. Limpieza profunda en la nube
		await deleteFolderFromCloudinary(folderPath).catch((err) => {
			console.error("Error no crítico en Cloudinary:", err);
		});

		// 3. Borrado en Supabase (Las capas y variantes se borran por CASCADE)
		const { error: dbError } = await supabase
			.from("avatar_config")
			.delete()
			.eq("id", projectId)
			.eq("user_id", user.id); // Seguridad extra

		if (dbError) throw dbError;

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: e.message }), {
			status: 500,
		});
	}
};
