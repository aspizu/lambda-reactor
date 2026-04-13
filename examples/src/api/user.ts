import {Response} from "#src/response"
import {z} from "zod"

import method from "../utils/method"

type User = {
    id: string
    name: string
    email: string
}

const users: User[] = [
    {id: "1", name: "Alice", email: "alice@example.com"},
    {id: "2", name: "Bob", email: "bob@example.com"},
]

const userSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
})

export const GET = method().handle(async ({event}) => {
    const match = event.path.match(/\/users\/([^/]+)/)
    if (match) {
        const user = users.find((u) => u.id === match[1])
        if (!user) {
            return Response.json(404, {error: "User not found"})
        }
        return Response.json(200, user)
    }
    return Response.json(200, users)
})

export const POST = method()
    .input(userSchema)
    .handle(async ({body}) => {
        const id = String(users.length + 1)
        const user: User = {id, ...body}
        users.push(user)
        return Response.json(201, user)
    })

export const PUT = method()
    .input(userSchema)
    .handle(async ({event, body}) => {
        const userId = event.pathParameters?.["user_id"]
        if (!userId) {
            return Response.json(400, {error: "Missing user_id"})
        }
        const index = users.findIndex((u) => u.id === userId)
        if (index === -1) {
            return Response.json(404, {error: "User not found"})
        }
        const user: User = {...users[index]!, ...body}
        users[index] = user
        return Response.json(200, user)
    })

export const DELETE = method().handle(async ({event}) => {
    const userId = event.pathParameters?.["user_id"]
    if (!userId) {
        return Response.json(400, {error: "Missing user_id"})
    }
    const index = users.findIndex((u) => u.id === userId)
    if (index === -1) {
        return Response.json(404, {error: "User not found"})
    }
    users.splice(index, 1)
    return Response.text(204, "")
})
