// src/pages/api/upload-variant.ts

import type { APIRoute } from "astro";
import { uploadFileToCloudinary } from "../../utils/cloudinary";
import { createSupabaseSSR } from "../../lib/supabase";

export const POST: APIRoute = async (context) => {
	const supabase = createSupabaseSSR(context);

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return new Response(JSON.stringify({ error: "Sesión inválida" }), {
			status: 401,
		});
	}

	try {
		const formData = await context.request.formData();
		const fileMaster = formData.get("file_master") as File;
		const fileProxy = formData.get("file_proxy") as File;
		const layerId = formData.get("layerId") as string;

		if (!fileMaster || !fileProxy || !layerId) {
			return new Response(
				JSON.stringify({
					error: "Faltan archivos o datos en el formulario",
				}),
				{
					status: 400,
				},
			);
		}

		const { data: layerData, error: layerError } = await supabase
			.from("layers")
			.select("project_id")
			.eq("id", layerId)
			.maybeSingle();

		if (layerError || !layerData) {
			return new Response(
				JSON.stringify({ error: "Capa no encontrada" }),
				{ status: 404 },
			);
		}

		const projectId = layerData.project_id;
		const pathBase = `users/${user.id}/projects/${projectId}/layers/${layerId}`;

		const [resMaster, resProxy] = await Promise.all([
			uploadFileToCloudinary(fileMaster, `${pathBase}/masters`),
			uploadFileToCloudinary(fileProxy, `${pathBase}/proxies`),
		]);

		const { error: dbError } = await supabase.from("variants").insert({
			layer_id: layerId,
			url_master: resMaster.secure_url,
			url_proxy: resProxy.secure_url,
			public_id_master: resMaster.public_id,
			public_id_proxy: resProxy.public_id,
		});

		if (dbError) throw dbError;

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (e: any) {
		console.error("[API UPLOAD VARIANT ERROR]:", e.message);
		return new Response(
			JSON.stringify({ error: "No se pudo procesar la imagen" }),
			{
				status: 500,
			},
		);
	}
};
