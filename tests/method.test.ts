import {Method} from "#src/method"
import {describe, expect, it} from "vitest"
import {z} from "zod"

describe("Method", () => {
    it("creates a method with no schema", () => {
        const m = new Method()
        expect(m.bodySchema).toBeUndefined()
        expect(m.outputSchema).toBeUndefined()
        expect(m.callback).toBeUndefined()
    })

    it("chains input schema", () => {
        const schema = z.object({name: z.string()})
        const m = new Method().input(schema)
        expect(m.bodySchema).toBe(schema)
    })

    it("chains output schema", () => {
        const schema = z.object({id: z.number()})
        const m = new Method().output(schema)
        expect(m.outputSchema).toBe(schema)
    })

    it("chains handle callback", () => {
        const cb = async () => ({ok: true})
        const m = new Method().handle(cb)
        expect(m.callback).toBe(cb)
    })

    it("preserves schemas through handle chain", () => {
        const input = z.object({x: z.string()})
        const output = z.object({y: z.number()})
        const cb = async () => ({y: 1})
        const m = new Method().input(input).output(output).handle(cb)
        expect(m.bodySchema).toBe(input)
        expect(m.outputSchema).toBe(output)
        expect(m.callback).toBe(cb)
    })
})
