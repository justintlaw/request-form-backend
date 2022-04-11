import { pipelines, Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { RequestFormBackendStack } from './request-form-backend-stack'

export class RequestFormPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props)

    new RequestFormBackendStack(this, 'RequestFormBackendStack')
  }
}
