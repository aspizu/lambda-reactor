import {createHandler} from "#src/handler"
import {method} from "#src/method"
import {Response} from "#src/response"

export const handler = createHandler({
    GET: method().handle(() => Response.text(200, "OK")),
})
