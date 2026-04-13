import type {Middleware} from "./middleware"

export class CORS {
    private _allowCredentials?: boolean
    private _allowHeaders?: string[]
    private _allowMethods?: string[]
    private _allowOrigin?: string[]
    private _exposeHeaders?: string[]
    private _maxAge?: number

    allowCredentials(allow: boolean = true): CORS {
        this._allowCredentials = allow
        return this
    }

    allowHeaders(...headers: string[]): CORS {
        this._allowHeaders = headers
        return this
    }

    allowMethods(...methods: string[]): CORS {
        this._allowMethods = methods
        return this
    }

    allowOrigin(...origins: string[]): CORS {
        this._allowOrigin = origins
        return this
    }

    exposeHeaders(...headers: string[]): CORS {
        this._exposeHeaders = headers
        return this
    }

    maxAge(age: number): CORS {
        this._maxAge = age
        return this
    }

    _toCorsOptions() {
        return {
            allowCredentials: this._allowCredentials,
            allowHeaders: this._allowHeaders,
            allowMethods: this._allowMethods,
            allowOrigins: this._allowOrigin ?? [],
            exposeHeaders: this._exposeHeaders,
            maxAge: this._maxAge,
        }
    }

    _toGatewayResponseHeaders(): Record<string, string> {
        const headers = this._toHeaders()
        return Object.fromEntries(
            Object.entries(headers).map(([key, value]) => [
                `gatewayresponse.header.${key}`,
                "'" + JSON.stringify(value).slice(1, -1) + "'",
            ]),
        )
    }

    private _toHeaders(): Record<string, string> {
        const headers: Record<string, string> = {}
        if (this._allowCredentials) {
            headers["Access-Control-Allow-Credentials"] = "true"
        }
        if (this._allowHeaders) {
            headers["Access-Control-Allow-Headers"] = this._allowHeaders.join(", ")
        }
        if (this._allowMethods) {
            headers["Access-Control-Allow-Methods"] = this._allowMethods.join(", ")
        }
        if (this._allowOrigin) {
            headers["Access-Control-Allow-Origin"] = this._allowOrigin.join(", ")
        }
        if (this._exposeHeaders) {
            headers["Access-Control-Expose-Headers"] = this._exposeHeaders.join(", ")
        }
        if (this._maxAge) {
            headers["Access-Control-Max-Age"] = this._maxAge.toString()
        }
        return headers
    }

    toMiddleware(): Middleware {
        return (result) => {
            const headers = this._toHeaders()
            return {...result, headers: {...result.headers, ...headers}}
        }
    }
}

/** Creates a new, empty {@link CORS} builder. */
export const cors = () => new CORS()
