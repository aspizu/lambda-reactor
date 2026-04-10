import {getMethods} from "#src/router"
import {describe, expect, it} from "vitest"

describe("getMethods", () => {
    it("extracts HTTP method names from a lambda handler file", () => {
        expect(
            getMethods(`export const handler = createHandler({GET, POST, DELETE})`),
        ).toEqual(["GET", "POST", "DELETE"])
    })

    it("returns empty array when no createHandler call is found", () => {
        expect(getMethods(`export const handler = () => {}`)).toEqual([])
    })
})
