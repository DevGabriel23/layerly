// src/env.d.ts
import type { User } from "@supabase/supabase-js";

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			token: string | null;
		}
	}

	interface Window {
		showToast: (
			message: string,
			type?: "error" | "success" | "info",
		) => void;
		openModal: (id: string) => void;
		closeModal: (id: string) => void;
	}
}

interface ImportMetaEnv {
	readonly PUBLIC_SUPABASE_URL: string;
	readonly PUBLIC_SUPABASE_ANON_KEY: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
