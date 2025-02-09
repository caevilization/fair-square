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
                target: "http://54.145.197.118:5000",
                // target: "http://localhost:5000",
                changeOrigin: true,
            },
        },
    },
    base: "/",
    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: true,
        cssTarget: "chrome61",
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
            },
        },
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
});
