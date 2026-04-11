import {createHandler} from "#src/handler"
import {method} from "#src/method"
import {cors} from "#src/middleware"
import {Response} from "#src/response"
import {z} from "zod"

const CreateUserSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
})

const CreatedUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
})

export const handler = createHandler({
    POST: method()
        .use(cors())
        .input(CreateUserSchema)
        .output(CreatedUserSchema)
        .handle(({body}) => {
            return Response.json(201, {id: crypto.randomUUID(), ...body})
        }),
})
