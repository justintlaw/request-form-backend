import { pipelines, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { RequestFormPipelineStage } from './request-form-pipleline-stage'

export class RequestFormPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection('justintlaw/request-form-backend', 'main', {
          connectionArn: 'GOES HERE' // TODO
        }),
        commands: [
          'cd src/api && npm install --production',
          'cd ../..',
          'npm install',
          'npm run build',
          'npx cdk synth'
        ]
      })
    })

    const devStage = pipeline.addStage(new RequestFormPipelineStage(this, 'dev', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
      }
    }))
  
    const prodStage = pipeline.addStage(new RequestFormPipelineStage(this, 'prod', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
      }
    }))
    prodStage.addPre(new pipelines.ManualApprovalStep('approval'))
  }
}
