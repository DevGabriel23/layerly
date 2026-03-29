// src/utils/cloudinary.ts
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
	cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
	api_key: import.meta.env.CLOUDINARY_API_KEY,
	api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export const deleteFromCloudinary = async (publicId: string) => {
	return cloudinary.uploader.destroy(publicId);
};

interface UploadOptions {
	folder: string;
	publicId: string;
}

export const uploadToCloudinary = async (
	source: File | string,
	options: UploadOptions,
): Promise<UploadApiResponse> => {
	return new Promise((resolve, reject) => {
		// Configuración común para ambos casos
		const uploadConfig = {
			folder: options.folder,
			public_id: options.publicId,
			overwrite: true,
			resource_type: "image" as const,
			transformation: [{ quality: "auto", fetch_format: "auto" }],
		};

		const handleResponse = (error: any, result: any) => {
			if (error) {
				reject(
					new Error(
						error.message || "Error desconocido en Cloudinary",
					),
				);
			} else {
				resolve(result as UploadApiResponse);
			}
		};

		// CASO 1: Es un string (Base64 de captura de skins/heads)
		if (typeof source === "string") {
			cloudinary.uploader.upload(source, uploadConfig, handleResponse);
		}
		// CASO 2: Es un File (Escudos o Sedes desde el formulario)
		else {
			const uploadStream = cloudinary.uploader.upload_stream(
				uploadConfig,
				handleResponse,
			);

			source
				.arrayBuffer()
				.then((arrayBuffer) => {
					uploadStream.end(Buffer.from(arrayBuffer));
				})
				.catch((e) =>
					reject(e instanceof Error ? e : new Error(String(e))),
				);
		}
	});
};

export const uploadFileToCloudinary = async (
	file: File,
	folder: string,
): Promise<UploadApiResponse> => {
	// Convertimos el File de Astro a un Buffer que Node.js pueda entender
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder,
					resource_type: "auto", // Detecta si es PNG o WebP automáticamente
				},
				(error, result) => {
					if (error) reject(error);
					else resolve(result as UploadApiResponse);
				},
			)
			.end(buffer);
	});
};

/**
 * Elimina todos los recursos de una carpeta y luego la carpeta misma
 */
export const deleteFolderFromCloudinary = async (folderPath: string) => {
	try {
		await cloudinary.api.delete_resources_by_prefix(folderPath);

		await cloudinary.api.delete_folder(folderPath);

		return { success: true };
	} catch (error: any) {
		if (error.error?.http_code === 404) {
			return { success: true, message: "Folder already gone" };
		}

		console.error("Error real en Cloudinary:", error);
		throw error;
	}
};
