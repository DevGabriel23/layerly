// src/lib/editor/canvas.ts

import type { EditorState } from "./types";

export function updateCanvas(
	state: EditorState,
	canvas: HTMLElement | null,
	placeholder: HTMLElement | null,
) {
	if (!canvas) return;

	// Limpiar render previo
	canvas.querySelectorAll(".layer-render").forEach((el) => el.remove());

	const layersToRender = Object.entries(state)
		.filter(
			([_, data]) => data.url !== null || (data.supportHex && data.color),
		)
		.sort((a, b) => a[1].z - b[1].z);

	if (layersToRender.length > 0) placeholder?.classList.add("hidden");
	else placeholder?.classList.remove("hidden");

	// Actualizar botones de exportación
	const hasContent = layersToRender.some(([_, d]) => d.url !== null);
	const exportBtns = document.querySelectorAll('[id^="export-btn"]');
	exportBtns.forEach(
		(btn) => ((btn as HTMLButtonElement).disabled = !hasContent),
	);

	layersToRender.forEach(([id, data]) => {
		const div = document.createElement("div");
		div.className =
			"layer-render absolute inset-0 w-full h-full pointer-events-none transition-all duration-300";
		div.style.zIndex = data.z.toString();
		div.style.isolation = "isolate";

		if (data.url) {
			if (data.supportHex) {
				const colorLayer = document.createElement("div");
				colorLayer.className = "absolute inset-0 w-full h-full";
				colorLayer.style.backgroundColor = data.color;

				const textureLayer = document.createElement("div");
				textureLayer.className = "absolute inset-0 w-full h-full";
				textureLayer.style.backgroundImage = `url('${data.url}')`;
				textureLayer.style.backgroundSize = "contain";
				textureLayer.style.backgroundRepeat = "no-repeat";
				textureLayer.style.backgroundPosition = "center";
				textureLayer.style.filter =
					"grayscale(1) contrast(1.2) brightness(1.1)";
				textureLayer.style.mixBlendMode = "multiply";

				div.appendChild(colorLayer);
				div.appendChild(textureLayer);
				div.style.maskImage =
					div.style.webkitMaskImage = `url('${data.url}')`;
				div.style.maskSize = "contain";
				div.style.maskRepeat = "no-repeat";
				div.style.maskPosition = "center";
			} else {
				const img = document.createElement("img");
				img.src = data.url;
				img.className = "w-full h-full object-contain";
				div.appendChild(img);
			}
		}
		/* else if (data.supportHex && data.color) {
			div.style.backgroundColor = data.color;
		} */
		canvas.appendChild(div);
	});
}
