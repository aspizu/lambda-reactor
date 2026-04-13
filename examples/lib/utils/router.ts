import {Router} from "#src/router"
import type {Stack} from "aws-cdk-lib"
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs"
import {RetentionDays} from "aws-cdk-lib/aws-logs"

import cors from "./cors"

export default (scope: Stack) =>
    new Router({
        cors,
        functionFactory: (path, entry) => {
            return new NodejsFunction(scope, path, {
                entry,
                handler: "handler",
                logRetention: RetentionDays.ONE_WEEK,
            })
        },
        resourceFactory: (api, _path, part) => {
            return api.root.addResource(part)
        },
    })
