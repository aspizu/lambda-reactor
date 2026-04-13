const _PROD_VALUES = new Set(["prod", "production"])

/**
 * Returns `true` when any of the conventional environment variables
 * (`NODE_ENV`, `STAGE`, `ENV`, `ENVIRONMENT`) indicate a production
 * deployment.
 */
export function _isProduction(): boolean {
    return (
        _isProductionValue(process.env["STAGE"]) ||
        _isProductionValue(process.env["NODE_ENV"]) ||
        _isProductionValue(process.env["ENV"]) ||
        _isProductionValue(process.env["ENVIRONMENT"])
    )
}

/**
 * Returns `true` if the given environment variable value represents a
 * production environment (`"production"` or `"prod"`, case-insensitive).
 */
function _isProductionValue(value: string | undefined): boolean {
    return value !== undefined && _PROD_VALUES.has(value.toLowerCase())
}
