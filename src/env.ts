const PROD_VALUES = new Set(["production", "prod"])

/**
 * Returns `true` if the given environment variable value represents a
 * production environment (`"production"` or `"prod"`, case-insensitive).
 */
function isProductionValue(value: string | undefined): boolean {
    return value !== undefined && PROD_VALUES.has(value.toLowerCase())
}

/**
 * Returns `true` when any of the conventional environment variables
 * (`NODE_ENV`, `STAGE`, `ENV`, `ENVIRONMENT`) indicate a production
 * deployment.
 */
export function isProduction(): boolean {
    return (
        isProductionValue(process.env["NODE_ENV"]) ||
        isProductionValue(process.env["STAGE"]) ||
        isProductionValue(process.env["ENV"]) ||
        isProductionValue(process.env["ENVIRONMENT"])
    )
}
