import { defineConfig } from "vite";

export default defineConfig({
    assetsInclude: ["**/*.glb"],
    build: {
        chunkSizeWarningLimit: 600,
    },
    server: {
        hmr: false
    }
});
