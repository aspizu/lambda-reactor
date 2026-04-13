import {Response} from "#src/response"

import {userSchema} from "../_user-schema"
import {users} from "../_users-store"
import method from "../../utils/method"

export const GET = method().handle(async ({event}) => {
    const userId = event.pathParameters?.["user_id"]
    if (!userId) {
        return Response.json(400, {error: "Missing user_id"})
    }
    const user = users.find((u) => u.id === userId)
    if (!user) {
        return Response.json(404, {error: "User not found"})
    }
    return Response.json(200, user)
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
        const user = {...users[index]!, ...body}
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
