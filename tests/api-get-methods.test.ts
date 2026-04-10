import {beforeEach, describe, expect, it, vi} from "vitest"

vi.mock("fs", () => ({
    readFileSync: vi.fn(),
}))

describe("getMethods", () => {
    beforeEach(() => {
        vi.resetModules()
    })

    it("extracts HTTP method names from a lambda handler file", async () => {
        const {readFileSync} = await import("fs")
        vi.mocked(readFileSync).mockReturnValue(
            `export const handler = createHandler({GET, POST, DELETE})`,
        )
        const {getMethods} = await import("#src/api")
        expect(getMethods("some/path")).toEqual(["GET", "POST", "DELETE"])
    })

    it("returns empty array when no createHandler call is found", async () => {
        const {readFileSync} = await import("fs")
        vi.mocked(readFileSync).mockReturnValue(`export const handler = () => {}`)
        const {getMethods} = await import("#src/api")
        expect(getMethods("some/path")).toEqual([])
    })
})
