import {createHandler} from "#src/handler"
import {method} from "#src/method"
import {Response} from "#src/response"
import {z} from "zod"

const ItemSchema = z.object({id: z.string(), label: z.string(), qty: z.number().int()})
const CreateItemSchema = ItemSchema.omit({id: true})
const ListSchema = z.array(ItemSchema)

const store: z.infer<typeof ItemSchema>[] = []

export const handler = createHandler({
    GET: method()
        .output(ListSchema)
        .handle(() => store),

    POST: method()
        .input(CreateItemSchema)
        .output(ItemSchema)
        .handle(({body}) => {
            const item = {id: crypto.randomUUID(), ...body}
            store.push(item)
            return Response.json(201, item)
        }),
})
