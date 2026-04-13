import {_isProduction} from "#src/_env"
import {afterEach, describe, expect, it} from "vitest"

const ENV_KEYS = ["NODE_ENV", "STAGE", "ENV", "ENVIRONMENT"] as const

describe("_isProduction", () => {
    afterEach(() => {
        for (const key of ENV_KEYS) {
            delete process.env[key]
        }
    })

    it("returns false when no env vars are set", () => {
        expect(_isProduction()).toBe(false)
    })

    for (const key of ENV_KEYS) {
        it(`returns true when ${key}=production`, () => {
            process.env[key] = "production"
            expect(_isProduction()).toBe(true)
        })

        it(`returns true when ${key}=prod`, () => {
            process.env[key] = "prod"
            expect(_isProduction()).toBe(true)
        })

        it(`returns true when ${key}=PRODUCTION (case-insensitive)`, () => {
            process.env[key] = "PRODUCTION"
            expect(_isProduction()).toBe(true)
        })

        it(`returns false when ${key}=development`, () => {
            process.env[key] = "development"
            expect(_isProduction()).toBe(false)
        })
    }
})
