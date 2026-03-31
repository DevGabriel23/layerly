// src/lib/editor/export.ts

import type { EditorState } from "./types";

export async function handleExport(state: EditorState, projectName: string) {
	window.showToast("Generando archivo...", "info");

	const layersToExport = Object.entries(state)
		.filter(([_, data]) => data.url || (data.supportHex && data.color))
		.sort((a, b) => a[1].z - b[1].z);

	if (layersToExport.length === 0)
		return window.showToast("No hay nada que exportar", "error");

	try {
		// 2. Cargar imágenes con CrossOrigin
		const loadImg = (url: string): Promise<HTMLImageElement> => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.src = url;
				img.onload = () => resolve(img);
				img.onerror = reject;
			});
		};

		let maxW = 1000;
		let maxH = 1000;

		const loadedLayers = await Promise.all(
			layersToExport.map(async ([id, data]) => {
				if (data.urlMaster) {
					const img = await loadImg(data.urlMaster);
					maxW = Math.max(maxW, img.width);
					maxH = Math.max(maxH, img.height);
					return { id, data, img };
				}
				return { id, data, img: null };
			}),
		);

		const cv = document.createElement("canvas");
		cv.width = maxW;
		cv.height = maxH;
		const ctx = cv.getContext("2d")!;

		// 3. Dibujar secuencialmente
		for (const { data, img } of loadedLayers) {
			if (img) {
				if (data.supportHex) {
					const tempCv = document.createElement("canvas");
					tempCv.width = maxW;
					tempCv.height = maxH;
					const tCtx = tempCv.getContext("2d")!;

					tCtx.fillStyle = data.color;
					tCtx.fillRect(0, 0, maxW, maxH);

					tCtx.globalCompositeOperation = "multiply";
					tCtx.filter =
						"grayscale(100%) contrast(120%) brightness(110%)";
					tCtx.drawImage(img, 0, 0, maxW, maxH);

					const maskCv = document.createElement("canvas");
					maskCv.width = maxW;
					maskCv.height = maxH;
					const mCtx = maskCv.getContext("2d")!;
					mCtx.drawImage(img, 0, 0, maxW, maxH);

					tCtx.globalCompositeOperation = "destination-in";
					tCtx.filter = "none";
					tCtx.drawImage(maskCv, 0, 0);

					ctx.drawImage(tempCv, 0, 0);
				} else {
					ctx.drawImage(img, 0, 0, maxW, maxH);
				}
			}
			/* else if (data.supportHex && data.color) {
				ctx.fillStyle = data.color;
				ctx.fillRect(0, 0, maxW, maxH);
			} */
		}

		// 4. Descargar
		const a = document.createElement("a");
		a.download = `${projectName}-${Date.now()}.png`;
		a.href = cv.toDataURL("image/png");
		a.click();
		window.showToast(`${projectName} exportado con éxito!`, "success");
	} catch (err) {
		console.error(err);
		window.showToast(
			"Error de CORS: Verifica los permisos de Cloudinary",
			"error",
		);
	}
}
