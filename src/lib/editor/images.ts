// src/lib/editor/images.ts

export async function processImageUpload(file: File): Promise<{ master: Blob; proxy: Blob }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const size = Math.max(img.width, img.height);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.width = canvas.height = size;
            ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2);

            canvas.toBlob((masterBlob) => {
                const pCanvas = document.createElement("canvas");
                pCanvas.width = pCanvas.height = 500;
                const pCtx = pCanvas.getContext("2d")!;
                pCtx.drawImage(canvas, 0, 0, 500, 500);
                pCanvas.toBlob((proxyBlob) => {
                    resolve({ master: masterBlob!, proxy: proxyBlob! });
                }, "image/webp", 0.8);
            }, "image/png");
        };
        img.onerror = reject;
    });
}