import type {APIGatewayProxyResult} from "aws-lambda"

export type Middleware = (result: APIGatewayProxyResult) => APIGatewayProxyResult

export function cors(headers: Record<string, string>): Middleware {
    return (result) => {
        const corsHeaders: Record<string, string> = {}
        for (const [key, value] of Object.entries(headers)) {
            corsHeaders[`Access-Control-${key}`] = value
        }
        return {...result, headers: {...result.headers, ...corsHeaders}}
    }
}
