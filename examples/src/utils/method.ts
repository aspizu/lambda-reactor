import {Method} from "#src/method"

import cors from "../../lib/utils/cors"

export default () => new Method().use(cors.toMiddleware())
