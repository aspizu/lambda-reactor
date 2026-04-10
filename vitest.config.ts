import {fileURLToPath, URL} from "node:url"

import {defineConfig} from "vitest/config"

export default defineConfig({
    resolve: {
        alias: {
            "#src": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    test: {
        globals: true,
        environment: "node",
        include: ["tests/**/*.test.{ts,tsx}"],
        setupFiles: ["./vitest.setup.ts"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
        },
    },
})
