import {createHandler} from "#src/handler"
import {method} from "#src/method"
import {Response} from "#src/response"
import {z} from "zod"

const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
})

export const handler = createHandler({
    GET: method()
        .output(UserSchema)
        .handle(({event}) => {
            const id = event.pathParameters?.["id"]
            if (!id) return Response.text(400, "Missing id")
            return {id, name: "Alice", email: "alice@example.com"}
        }),
})
