import type {z} from "zod"

import type {userSchema} from "./_user-schema"

export type User = z.infer<typeof userSchema> & {id: string}

export const users: User[] = [
    {id: "1", name: "Alice", email: "alice@example.com"},
    {id: "2", name: "Bob", email: "bob@example.com"},
]
