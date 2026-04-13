import {Response} from "#src/response"

import method from "../utils/method"
import {userSchema} from "./_user-schema"
import {users} from "./_users-store"

export const GET = method().handle(async () => {
    return Response.json(200, users)
})

export const POST = method()
    .input(userSchema)
    .handle(async ({body}) => {
        const id = String(users.length + 1)
        const user = {id, ...body}
        users.push(user)
        return Response.json(201, user)
    })
