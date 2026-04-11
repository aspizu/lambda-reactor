import js from "@eslint/js"
import perfectionist from "eslint-plugin-perfectionist"
import {defineConfig} from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig(
    {ignores: ["dist"]},
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        languageOptions: {parserOptions: {projectService: true}},
        plugins: {perfectionist},
        rules: {
            "max-lines": ["error", 100],
            "@typescript-eslint/no-deprecated": "error",
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
    },
)
