// src/lib/editor/types.ts

export interface LayerState {
	url: string | null;
	urlMaster: string | null;
	color: string;
	z: number;
	supportHex: boolean;
}

export type EditorState = Record<string, LayerState>;

export interface EditorElements {
	canvas: HTMLElement | null;
	placeholder: HTMLElement | null;
	list: HTMLElement | null;
	projectId: string | undefined;
	projectName: string;
	nameInput: HTMLInputElement | null;
	hexCheck: HTMLInputElement | null;
	defaultColorContainer: HTMLElement | null;
	newLayerPicker: HTMLElement | null;
	sheet: HTMLElement | null;
	handle: HTMLElement | null;
	overlay: HTMLElement | null;
}
