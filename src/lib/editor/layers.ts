// src/lib/editor/layers.ts

import type { EditorElements, EditorState } from "./types";

export function initEditorElements(): EditorElements {
	const root = document.getElementById("editor-root");
	return {
		canvas: document.getElementById("canvas-container"),
		placeholder: document.getElementById("canvas-placeholder"),
		list: document.getElementById("layers-list"),
		projectId: root?.dataset.projectId,
		projectName:
			(document.getElementById("export-btn-desktop") as HTMLButtonElement)
				?.dataset.projectName || "avatar",
		nameInput: document.getElementById(
			"layer-name-input",
		) as HTMLInputElement,
		hexCheck: document.getElementById(
			"layer-hex-check",
		) as HTMLInputElement,
		defaultColorContainer: document.getElementById(
			"default-color-container",
		),
		newLayerPicker: document.querySelector(
			".new-layer-color-picker",
		) as HTMLElement,
		sheet: document.getElementById("layers-sheet"),
		handle: document.getElementById("sheet-handle"),
		overlay: document.getElementById("sheet-overlay"),
	};
}

export function resetNewLayerModal(elements: EditorElements) {
	if (elements.nameInput) elements.nameInput.value = "";
	if (elements.hexCheck) {
		elements.hexCheck.checked = false;
		elements.hexCheck.dispatchEvent(new Event("change"));
	}
	const dot = elements.newLayerPicker?.querySelector(
		".magic-picker-dot",
	) as HTMLInputElement;
	const text = elements.newLayerPicker?.querySelector(
		".magic-picker-text",
	) as HTMLInputElement;
	if (dot) dot.value = "#FFB5C2";
	if (text) text.value = "FFB5C2";
}

export async function deleteVariant(
	variantId: string,
	button: HTMLButtonElement,
) {
	if (!confirm("¿Eliminar esta variante?")) return;

	button.innerHTML =
		'<div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
	button.disabled = true;

	const res = await fetch("/api/delete-variant", {
		method: "POST",
		body: JSON.stringify({ variantId }),
		headers: { "Content-Type": "application/json" },
	});

	if (res.ok) window.location.reload();
	else {
		window.showToast("Error al eliminar", "error");
		button.disabled = false;
	}
}

export async function deleteLayer(button: HTMLButtonElement) {
	const id = button.dataset.layerId;
	const name = button.dataset.layerName || "esta capa";

	if (!confirm(`¿Eliminar la capa "${name}"?`)) return;

	button.innerHTML =
		'<div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
	button.disabled = true;

	const res = await fetch("/api/delete-layer", {
		method: "POST",
		body: JSON.stringify({ layerId: id }),
		headers: { "Content-Type": "application/json" },
	});

	if (res.ok) window.location.reload();
	else {
		window.showToast("Error al eliminar la capa", "error");
		button.disabled = false;
	}
}

export async function createLayer(
	elements: EditorElements,
	state: EditorState,
) {
	const { nameInput, hexCheck, newLayerPicker, projectId } = elements;

	if (!nameInput || !projectId) return;

	const name = nameInput.value;
	const supportHex = hexCheck?.checked || false;

	// Obtener color del picker
	const internalPicker = newLayerPicker?.querySelector(
		".magic-picker-dot",
	) as HTMLInputElement;
	const defaultHex = supportHex
		? internalPicker?.value.replace("#", "")
		: null;

	if (!name) {
		window.showToast("¡Ponle un nombre a tu creación!", "error");
		return;
	}

	// Calcular el siguiente Z-Order basándonos en el estado actual
	const currentZValues = Object.values(state).map((s) => s.z);
	const maxZ = currentZValues.length > 0 ? Math.max(...currentZValues) : -10;
	const nextZ = maxZ + 10;

	window.showToast("Sembrando nueva capa...", "info");

	const { supabase } = await import("../supabase"); // Import dinámico para evitar líos de carga

	const { error } = await supabase.from("layers").insert({
		project_id: projectId,
		name: name,
		support_hex: supportHex,
		default_hex: defaultHex,
		z_order: nextZ,
	});

	if (!error) {
		window.location.reload();
	} else {
		console.error(error);
		window.showToast("No pudimos crear la capa", "error");
	}
}

export function toggleSheet(elements: EditorElements) {
	const { sheet, overlay } = elements;
	const isClosed = sheet?.classList.contains("translate-y-[calc(100%)]");
	console.log("isClosed", isClosed);
	if (isClosed) {
		sheet?.classList.remove("translate-y-[calc(100%)]");
		overlay?.classList.add("opacity-100", "pointer-events-auto");
		overlay?.classList.remove("pointer-events-none");
	} else {
		sheet?.classList.add("translate-y-[calc(100%)]");
		overlay?.classList.remove("opacity-100", "pointer-events-auto");
		overlay?.classList.add("pointer-events-none");
	}
}
