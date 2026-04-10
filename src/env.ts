const PROD_VALUES = new Set(["production", "prod"])

function isProductionValue(value: string | undefined): boolean {
    return value !== undefined && PROD_VALUES.has(value.toLowerCase())
}

export function isProduction(): boolean {
    return (
        isProductionValue(process.env["NODE_ENV"]) ||
        isProductionValue(process.env["STAGE"]) ||
        isProductionValue(process.env["ENV"]) ||
        isProductionValue(process.env["ENVIRONMENT"])
    )
}
