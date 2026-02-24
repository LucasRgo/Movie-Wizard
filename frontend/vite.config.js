import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const fromRoot = (relativePath) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            react: fromRoot("./node_modules/react"),
            "react-dom": fromRoot("./node_modules/react-dom"),
            "react-router-dom": fromRoot("./node_modules/react-router-dom"),
            "js-cookie": fromRoot("./node_modules/js-cookie"),
        },
        dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
        include: ["react", "react-dom", "react-router-dom", "js-cookie"],
    },
    server: {
        proxy: {
            "/api": {
                target: process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8000",
                changeOrigin: true,
            },
        },
    },
});
