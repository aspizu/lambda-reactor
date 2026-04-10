import {join} from "path"

import type {IFunction} from "aws-cdk-lib/aws-lambda"
export type FunctionFactory = (entry: string, id: string) => IFunction

export function buildHandlers<TPaths extends string>(
    paths: TPaths[],
    factory: FunctionFactory,
): Record<TPaths, IFunction> {
    return Object.fromEntries(
        paths.map((path) => [
            path,
            factory(join(process.cwd(), "src", `${path}.ts`), path),
        ]),
    ) as Record<TPaths, IFunction>
}
