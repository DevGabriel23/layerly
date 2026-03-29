// src/pages/api/upload-variant.ts

import type { APIRoute } from "astro";
import { uploadFileToCloudinary } from "../../utils/cloudinary";
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

	// Ahora 'user' ya no es undefined
	console.log("Subida iniciada por:", user.email);

	try {
		const formData = await request.formData();
		const fileMaster = formData.get("file_master") as File;
		const fileProxy = formData.get("file_proxy") as File;
		const layerId = formData.get("layerId") as string;

		if (!fileMaster || !fileProxy || !layerId) {
			return new Response("Faltan archivos en el formulario", {
				status: 400,
			});
		}

		const { data: layerData, error: layerError } = await supabase
			.from("layers")
			.select("project_id")
			.eq("id", layerId)
			.single();

		if (layerError || !layerData)
			throw new Error("No se pudo encontrar el proyecto de la capa");

		const projectId = layerData.project_id;

		const pathBase = `users/${user.id}/projects/${projectId}/layers/${layerId}`;
		const masterFolder = `${pathBase}/masters`;
		const proxyFolder = `${pathBase}/proxies`;

		// 4. Subida Dual
		const [resMaster, resProxy] = await Promise.all([
			uploadFileToCloudinary(fileMaster, masterFolder),
			uploadFileToCloudinary(fileProxy, proxyFolder),
		]);

		const { error: dbError } = await supabase.from("variants").insert({
			layer_id: layerId,
			url_master: resMaster.secure_url, // El PNG original pesado
			url_proxy: resProxy.secure_url, // El WebP optimizado
			public_id_master: resMaster.public_id,
			public_id_proxy: resProxy.public_id,
		});

		if (dbError) throw dbError;

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: e.message }), {
			status: 500,
		});
	}
};
