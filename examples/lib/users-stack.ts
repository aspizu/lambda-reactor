import type {StackProps} from "aws-cdk-lib"
import {Stack} from "aws-cdk-lib"

export class UsersStack extends Stack {
    constructor(scope: Stack, id: string, props?: StackProps) {
        super(scope, id, props)
    }
}
