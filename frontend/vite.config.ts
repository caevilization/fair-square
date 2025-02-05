import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 8080,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
            "/eliza": {
                target: "http://54.145.197.118:3000",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/eliza/, ""),
            },
        },
    },
    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom", "react-router-dom"],
                    ui: ["antd", "@ant-design/icons", "@heroicons/react"],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    css: {
        devSourcemap: true,
    },
    publicDir: "public",
    base: "./",
});
