# 🎨 Layerly

**Layerly** es un potente motor de creación de personajes y avatares basado en la web. Permite a los usuarios construir arte complejo mediante un sistema de capas dinámicas, personalización de colores mediante tintado inteligente y una infraestructura optimizada en la nube.

> Inspirado en herramientas como Picrew, pero potenciado con tecnología moderna de procesamiento de imágenes en el cliente.

## ✨ Características Principales

* **Sistema de Capas Dinámico:** Reordenamiento de assets mediante *Drag & Drop* con sincronización de `z-index`.
* **Tintado Inteligente:** Algoritmo personalizado que permite aplicar colores hexadecimales a cualquier imagen conservando sus sombras y detalles originales (usando filtros CSS y modos de mezcla).
* **Optimización Dual de Assets:** * **Proxies:** Versiones WebP ligeras procesadas en el cliente para un rendimiento de edición fluido.
    * **Masters:** Versiones PNG en alta resolución para exportaciones de calidad profesional.
* **Arquitectura Serverless:** Desarrollado con **Astro**, **Supabase** (Auth & DB) y **Cloudinary** (Storage & Transformaciones).
* **Exportación HD:** Generación de imágenes finales directamente en el navegador combinando múltiples capas en un canvas dinámico.

## 🚀 Estructura del Proyecto

```text
/
├── public/          # Assets estáticos
├── src/
│   ├── components/  # Componentes de interfaz (Astro & UI)
│   ├── layouts/     # Plantillas de página
│   ├── lib/         # Configuraciones (Supabase client, etc.)
│   ├── pages/       
│   │   ├── api/     # Endpoints del servidor (Upload, Delete, Auth)
│   │   ├── editor/  # El núcleo de la aplicación (Canvas & State)
│   │   └── dashboard.astro
│   └── utils/       # Lógica de Cloudinary y procesamiento de imagen
└── package.json
```

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio:**
   ```sh
   git clone https://github.com/DevGabriel23/layerly.git
   cd layerly
   ```

2. **Instalar dependencias:**
   ```sh
   npm install
   ```

3. **Variables de Entorno:**
   Crea un archivo `.env` en la raíz con tus credenciales:
   ```env
   PUBLIC_SUPABASE_URL=tu_url
   PUBLIC_SUPABASE_ANON_KEY=tu_key
   SUPABASE_SERVICE_ROLE_KEY=tu_role_key
   CLOUDINARY_CLOUD_NAME=tu_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

4. **Iniciar en desarrollo:**
   ```sh
   npm run dev
   ```

## 🧞 Comandos Comunes

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build` | Compila el proyecto para producción en `./dist/` |
| `npm run preview` | Previsualiza la compilación local antes de desplegar |
| `npm run astro ...` | Ejecuta comandos de CLI como `astro add` o `astro check` |

## 📐 Decisiones de Ingeniería

* **Procesamiento Client-Side:** Las imágenes se recortan y optimizan en el navegador antes de subir a la nube para reducir el consumo de ancho de banda y créditos de Cloudinary.
* **Estructura de Carpetas en Cloudinary:** Los archivos se organizan jerárquicamente por `user_id`, `project_id` y `layer_id` para permitir limpiezas masivas y una gestión de storage eficiente.
* **Estado Reactivo en el Editor:** Se utiliza un objeto de estado centralizado para coordinar el renderizado del canvas con la UI de gestión de capas sin necesidad de frameworks pesados.

---
Creado con ❤️ por Rehin.

---
