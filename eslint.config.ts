import js from "@eslint/js"
import perfectionist from "eslint-plugin-perfectionist"
import {defineConfig} from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig(js.configs.recommended, tseslint.configs.recommended, {
    plugins: {perfectionist},
    rules: {
        "max-lines": ["error", 100],
        "perfectionist/sort-imports": [
            "error",
            {
                type: "alphabetical",
                order: "asc",
                groups: [
                    "builtin",
                    "external",
                    "internal",
                    ["parent", "sibling", "index"],
                ],
            },
        ],
    },
})
