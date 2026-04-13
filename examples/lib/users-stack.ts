import type {StackProps} from "aws-cdk-lib"
import {Stack} from "aws-cdk-lib"
import {RestApi} from "aws-cdk-lib/aws-apigateway"

import router from "./utils/router"

export class UsersStack extends Stack {
    constructor(scope: Stack, id: string, props?: StackProps) {
        super(scope, id, props)
        const api = new RestApi(this, "UsersRestApi")
        router(this).route("/user").route("/user/{user_id}").defineRestApi(api)
    }
}
